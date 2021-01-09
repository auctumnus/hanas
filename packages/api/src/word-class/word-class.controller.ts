import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  ForbiddenException,
  Patch,
  UseGuards,
} from '@nestjs/common'
import { WordClassService } from './word-class.service'
import { CreateWordClassDto } from './dto/create-word-class.dto'
import { UpdateWordClassDto } from './dto/update-word-class.dto'
import { LangService } from '../lang/lang.service'
import { Request } from 'express'
import { getPermission } from '../auth/checkUser'
import { LangPermissions } from '../lang-permissions/entities/lang-permissions.entity'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller()
export class WordClassController {
  constructor(
    private readonly wordClassService: WordClassService,
    private readonly langService: LangService,
  ) {}

  checkPermission(permission: LangPermissions) {
    if (!(permission.owner || permission.changeInfo)) {
      throw new ForbiddenException(
        'User does not have permission to update word classes for this language.',
      )
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createWordClassDto: CreateWordClassDto,
    @Param('lang_id') langId: string,
    @Req() req: Request,
  ) {
    const lang = await this.langService.findOne(langId)
    this.checkPermission(getPermission(req, lang))
    return this.wordClassService.create(lang, createWordClassDto)
  }

  @Get()
  async findAll(@Param('lang_id') langId: string) {
    return this.wordClassService.findAll(langId)
  }

  @Get(':abbreviation')
  async findOne(
    @Param('abbreviation') abbreviation: string,
    @Param('lang_id') langId: string,
  ) {
    return this.wordClassService.findOne(langId, abbreviation)
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':abbreviation')
  async update(
    @Param('abbreviation') abbreviation: string,
    @Param('lang_id') langId: string,
    @Body() updateWordClassDto: UpdateWordClassDto,
    @Req() req: Request,
  ) {
    const lang = await this.langService.findOne(langId)
    this.checkPermission(getPermission(req, lang))
    return this.wordClassService.update(lang, abbreviation, updateWordClassDto)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':abbreviation')
  async remove(
    @Param('abbreviation') abbreviation: string,
    @Param('lang_id') langId: string,
    @Req() req: Request,
  ) {
    const lang = await this.langService.findOne(langId)
    this.checkPermission(getPermission(req, lang))
    return this.wordClassService.remove(lang, abbreviation)
  }
}
