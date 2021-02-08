import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
  Req,
  ForbiddenException,
} from '@nestjs/common'
import { WordService } from './word.service'
import { CreateWordDto } from './dto/create-word.dto'
import { UpdateWordDto } from './dto/update-word.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Request } from 'express'
import { getPermission, getReqUser } from '../auth/checkUser'
import { LangService } from '../lang/lang.service'
import { getLimitAndCursor } from '../paginator'
import { Lang } from '../lang/entities/lang.entity'
import { UserService } from '../user/user.service'

const checkPermission = (req: Request, lang: Lang) => {
  if (!getPermission(req, lang)?.changeWords) {
    throw new ForbiddenException(
      'User does not have permission to change words for this language.',
    )
  }
}

@Controller()
export class WordController {
  constructor(
    private readonly wordService: WordService,
    private readonly langService: LangService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Param('lang_id') langId: string,
    @Body() createWordDto: CreateWordDto,
    @Req() req: Request,
  ) {
    const lang = await this.langService.findOne(langId)
    checkPermission(req, lang)
    const username = getReqUser(req).username
    const creator = await this.userService.findOne(username)
    return this.wordService.create(lang, creator, createWordDto)
  }

  @Get()
  findAll(@Param('lang_id') langId: string, @Req() req: Request) {
    const { limit, cursor } = getLimitAndCursor(req)
    return this.wordService.findAll(langId, limit, cursor)
  }

  @Get(':word')
  findOne(@Param('lang_id') langId: string, @Param('word') word: string) {
    return this.wordService.findOne(langId, word)
  }

  @Get(':word/:num')
  findOneByNumber(
    @Param('lang_id') langId: string,
    @Param('word') word: string,
    @Param('num') num: number,
  ) {
    return this.wordService.findOneByNumber(langId, word, num)
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':word/:num')
  async update(
    @Param('lang_id') langId: string,
    @Param('word') word: string,
    @Param('num') num: number,
    @Req() req: Request,
    @Body() updateWordDto: UpdateWordDto,
  ) {
    const lang = await this.langService.findOne(langId)
    checkPermission(req, lang)
    return this.wordService.update(lang, word, num, updateWordDto)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':word/:num')
  async remove(
    @Param('lang_id') langId: string,
    @Param('word') word: string,
    @Param('num') num: number,
    @Req() req: Request,
  ) {
    const lang = await this.langService.findOne(langId)
    checkPermission(req, lang)
    return this.wordService.remove(lang, word, num)
  }
}
