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
} from '@nestjs/common'
import { Request } from 'express'
import { CreateLangDto } from './dto/create-lang.dto'
import { UpdateLangDto } from './dto/update-lang.dto'
import { LangService } from './lang.service'
import { getLimitAndCursor } from '../paginator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { UserService } from '../user/user.service'
import { getReqUser } from '../auth/checkUser'
import { getUserPermissions } from '../lang-permissions/lang-permissions.service'

@Controller()
export class LangController {
  constructor(
    private readonly langService: LangService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createLangDto: CreateLangDto, @Req() req: Request) {
    const { username } = getReqUser(req)
    const user = await this.userService.findOne(username)
    return this.langService.create(createLangDto, user)
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
      throw new UnauthorizedException(
        'User does not have permissions to change language information.',
      )
    if (!perms.changeId && updateLangDto.id)
      throw new UnauthorizedException(
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
      throw new UnauthorizedException(
        'Cannot delete language if user is not owner.',
      )
    }
    return this.langService.remove(id)
  }
}
