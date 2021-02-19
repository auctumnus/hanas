import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Patch,
  Req,
  UseGuards,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
  ForbiddenException,
} from '@nestjs/common'
import { Request } from 'express'
import { CreateLangDto } from './dto/create-lang.dto'
import { UpdateLangDto } from './dto/update-lang.dto'
import { LangService } from './lang.service'
import { getLimitAndCursor } from '../paginator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { getReqUser } from '../auth/checkUser'
import { getUserPermissions } from '../lang-permissions/lang-permissions.service'
import { FileInterceptor } from '@nestjs/platform-express'
import { multerSettings, S3File, validateFile } from '../s3'
import { ALLOWED_TYPES, FLAG_MAX_HEIGHT, FLAG_MAX_WIDTH } from '../constants'

const flagSettings = {
  maxWidth: FLAG_MAX_WIDTH,
  maxHeight: FLAG_MAX_HEIGHT,
}

@Controller()
export class LangController {
  constructor(private readonly langService: LangService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createLangDto: CreateLangDto, @Req() req: Request) {
    const { username } = getReqUser(req)
    return this.langService.create(createLangDto, username)
  }

  @Get()
  async findAll(@Req() req: Request) {
    const { limit, cursor } = getLimitAndCursor(req)
    return this.langService.findAll(limit, cursor)
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.langService.findOne(id)
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLangDto: UpdateLangDto,
    @Req() req: Request,
  ) {
    const { username } = getReqUser(req)
    const lang = await this.findOne(id)
    const perms = getUserPermissions(lang, username)
    if (!perms.changeInfo && (updateLangDto.description || updateLangDto.name))
      throw new ForbiddenException(
        'User does not have permissions to change language information.',
      )
    if (!perms.changeId && updateLangDto.id)
      throw new ForbiddenException(
        'User does not have permission to change language id.',
      )
    return this.langService.update(id, updateLangDto)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request): Promise<void> {
    const { username } = getReqUser(req)
    const lang = await this.findOne(id)
    if (lang.owner.username !== username) {
      throw new ForbiddenException(
        'Cannot delete language if user is not owner.',
      )
    }
    return this.langService.remove(id)
  }

  // flag endpoints
  @Get(':id/flag')
  async getFlag(@Param('id') id: string) {
    const lang = await this.findOne(id)
    return lang.flag
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('flag', multerSettings(flagSettings)))
  @Post(':id/flag')
  async createFlag(
    @Param('id') id: string,
    @Req() req: Request,
    @UploadedFile() file: S3File,
  ) {
    validateFile(file, ALLOWED_TYPES)
    const lang = await this.findOne(id)
    const { username } = getReqUser(req)
    const perms = getUserPermissions(lang, username)
    if (!perms.changeInfo) {
      throw new ForbiddenException(
        'User does not have permission to change language flag.',
      )
    }
    return this.langService.createFlag(lang, file)
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('flag', multerSettings(flagSettings)))
  @Patch(':id/flag')
  async updateFlag(
    @Param('id') id: string,
    @Req() req: Request,
    @UploadedFile() file: S3File,
  ) {
    return this.createFlag(id, req, file)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/flag')
  async deleteFlag(@Param('id') id: string, @Req() req: Request) {
    const lang = await this.findOne(id)
    const { username } = getReqUser(req)
    const perms = getUserPermissions(lang, username)
    if (!perms.changeInfo) {
      throw new ForbiddenException(
        'User does not have permission to change language flag.',
      )
    }
    return this.langService.removeFlag(lang)
  }
}
