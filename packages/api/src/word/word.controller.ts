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
import { ApiPaginated, getLimitAndCursor, pagedSchema } from '../paginator'
import { Lang } from '../lang/entities/lang.entity'
import { UserService } from '../user/user.service'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  PartialType,
} from '@nestjs/swagger'
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../errors'
import { Word } from './entities/word.entity'
import { DeleteSuccess } from '../deleteSuccess'

const checkPermission = (req: Request, lang: Lang) => {
  if (!getPermission(req, lang)?.changeWords) {
    throw new ForbiddenException(
      'User does not have permission to change words for this language.',
    )
  }
}

class UpdateWordSwaggerDto extends PartialType(CreateWordDto) {}

@ApiTags('Words')
@Controller()
export class WordController {
  constructor(
    private readonly wordService: WordService,
    private readonly langService: LangService,
    private readonly userService: UserService,
  ) {}

  @ApiOperation({
    description: 'Creates a word.',
    summary: 'Create a word',
  })
  @ApiCreatedResponse({ type: Lang })
  @ApiUnauthorizedResponse({ type: UnauthorizedError })
  @ApiForbiddenResponse({ type: ForbiddenError })
  @ApiBadRequestResponse({ type: BadRequestError })
  @ApiConflictResponse({ type: ConflictError })
  @ApiBearerAuth()
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

  @ApiOperation({
    description: 'Finds all words in a language.',
    summary: 'Get all words',
  })
  @ApiNotFoundResponse({ type: NotFoundError })
  @ApiOkResponse(pagedSchema(Word))
  @ApiPaginated()
  @Get()
  findAll(@Param('lang_id') langId: string, @Req() req: Request) {
    const { limit, cursor } = getLimitAndCursor(req)
    return this.wordService.findAll(langId, limit, cursor)
  }

  @ApiOperation({
    description:
      'Finds words by their orthographic representation. You should ' +
      'encode any value here to be value-safe; otherwise parts may ' +
      'be interpreted as other things than a parameter. Note that' +
      'this will return an array, since multiple words can have the' +
      'same representation / pronunciation. Use the :word/:num ' +
      'endpoint to get one specific word.',
    summary: 'Get words',
  })
  @ApiOkResponse({ type: [Word] })
  @ApiNotFoundResponse({ type: NotFoundError })
  @Get(':word')
  findOne(@Param('lang_id') langId: string, @Param('word') word: string) {
    return this.wordService.findOne(langId, word)
  }

  @ApiOperation({
    description:
      'Finds a word by its orthographic representation and order of ' +
      'addition. The index will be the same as its index in the value ' +
      'returned by the :word endpoint. Again, ensure this is URL-safe.',
    summary: 'Get a specific word',
  })
  @ApiOkResponse({ type: Word })
  @ApiNotFoundResponse({ type: NotFoundError })
  @Get(':word/:num')
  findOneByNumber(
    @Param('lang_id') langId: string,
    @Param('word') word: string,
    @Param('num') num: number,
  ) {
    return this.wordService.findOneByNumber(langId, word, num)
  }

  @ApiOperation({
    description: 'Updates a word.',
    summary: 'Update a word',
  })
  @ApiBody({ type: UpdateWordSwaggerDto })
  @ApiBearerAuth()
  @ApiOkResponse({ type: Word })
  @ApiNotFoundResponse({ type: NotFoundError })
  @ApiForbiddenResponse({ type: ForbiddenError })
  @ApiUnauthorizedResponse({ type: UnauthorizedError })
  @UseGuards(JwtAuthGuard)
  @Patch(':word/:num')
  async update(
    @Param('lang_id') langId: string,
    @Param('word') word: string,
    @Param('num') num: number,
    @Req() req: Request,
    @Body() updateWordDto: UpdateWordDto,
  ) {
    const { username } = getReqUser(req)
    const lang = await this.langService.findOne(langId)
    const updater = await this.userService.findOne(username)
    checkPermission(req, lang)
    return this.wordService.update(lang, updater, word, num, updateWordDto)
  }

  @ApiOperation({
    description: 'Deletes a word.',
    summary: 'Delete a word',
  })
  @ApiBearerAuth()
  @ApiOkResponse({ type: DeleteSuccess })
  @ApiNotFoundResponse({ type: NotFoundError })
  @ApiForbiddenResponse({ type: ForbiddenError })
  @ApiUnauthorizedResponse({ type: UnauthorizedError })
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
