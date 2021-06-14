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
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger'
import {WordClass} from './entities/word-class.entity'
import {BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError} from 'src/errors'
import {DeleteSuccess} from 'src/deleteSuccess'

@ApiTags('Word classes')
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
  @ApiOperation({
    description: 'Creates a word class.',
    summary: 'Create a word class'
  })
  @ApiCreatedResponse({type: WordClass})
  @ApiNotFoundResponse({type: NotFoundError})
  @ApiForbiddenResponse({type: ForbiddenError})
  @ApiBadRequestResponse({type: BadRequestError})
  @ApiUnauthorizedResponse({type: UnauthorizedError})
  @ApiBearerAuth()
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

  @ApiOperation({
    description: 'Gets all the word classes in a language.',
    summary: 'Get all word classes'
  })
  @ApiOkResponse({type: [WordClass]})
  @ApiNotFoundResponse({type: NotFoundError})
  @Get()
  async findAll(@Param('lang_id') langId: string) {
    return this.wordClassService.findAll(langId)
  }

  @ApiOperation({
    description: 'Gets a specific word class by its abbreviation.',
    summary: 'Get a word class'
  })
  @ApiOkResponse({type: WordClass})
  @ApiNotFoundResponse({type: NotFoundError})
  @Get(':abbreviation')
  async findOne(
    @Param('abbreviation') abbreviation: string,
    @Param('lang_id') langId: string,
  ) {
    return this.wordClassService.findOne(langId, abbreviation)
  }

  @ApiOperation({
    description: 'Updates a word class.',
    summary: 'Update a word class'
  })
  @ApiOkResponse({type: WordClass})
  @ApiNotFoundResponse({type: NotFoundError})
  @ApiForbiddenResponse({type: ForbiddenError})
  @ApiUnauthorizedResponse({type: UnauthorizedError})
  @ApiBearerAuth()
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

  @ApiOperation({
    description: 'Deletes a word class.',
    summary: 'Delete a word class'
  })
  @ApiOkResponse({type: DeleteSuccess})
  @ApiNotFoundResponse({type: NotFoundError})
  @ApiForbiddenResponse({type: ForbiddenError})
  @ApiUnauthorizedResponse({type: UnauthorizedError})
  @ApiBearerAuth()
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
