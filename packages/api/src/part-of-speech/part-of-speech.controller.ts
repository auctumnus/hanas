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
import { PartOfSpeechService } from './part-of-speech.service'
import { CreatePartOfSpeechDto } from './dto/create-part-of-speech.dto'
import { UpdatePartOfSpeechDto } from './dto/update-part-of-speech.dto'
import { LangService } from '../lang/lang.service'
import { Request } from 'express'
import { getPermission } from '../auth/checkUser'
import { LangPermissions } from '../lang-permissions/entities/lang-permissions.entity'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller()
export class PartOfSpeechController {
  constructor(
    private readonly partOfSpeechService: PartOfSpeechService,
    private readonly langService: LangService,
  ) {}

  checkPermission(permission: LangPermissions) {
    if (!(permission.owner || permission.changeInfo)) {
      throw new ForbiddenException(
        'User does not have permission to update parts of speech for this language.',
      )
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createPartOfSpeechDto: CreatePartOfSpeechDto,
    @Param('lang_id') langId: string,
    @Req() req: Request,
  ) {
    const lang = await this.langService.findOne(langId)
    this.checkPermission(getPermission(req, lang))
    return this.partOfSpeechService.create(lang, createPartOfSpeechDto)
  }

  @Get()
  async findAll(@Param('lang_id') langId: string) {
    return this.partOfSpeechService.findAll(langId)
  }

  @Get(':abbreviation')
  async findOne(
    @Param('abbreviation') abbreviation: string,
    @Param('lang_id') langId: string,
  ) {
    return this.partOfSpeechService.findOne(langId, abbreviation)
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':abbreviation')
  async update(
    @Param('abbreviation') abbreviation: string,
    @Param('lang_id') langId: string,
    @Body() updatePartOfSpeechDto: UpdatePartOfSpeechDto,
    @Req() req: Request,
  ) {
    const lang = await this.langService.findOne(langId)
    this.checkPermission(getPermission(req, lang))
    return this.partOfSpeechService.update(
      lang,
      abbreviation,
      updatePartOfSpeechDto,
    )
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
    return this.partOfSpeechService.remove(lang, abbreviation)
  }
}
