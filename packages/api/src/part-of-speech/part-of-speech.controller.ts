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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  PartialType,
} from '@nestjs/swagger'
import { PartOfSpeech } from './entities/part-of-speech.entity'
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../errors'
import { DeleteSuccess } from '../deleteSuccess'

class UpdatePartOfSpeechSwaggerDto extends PartialType(CreatePartOfSpeechDto) {}

@ApiTags('Parts of Speech')
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

  @ApiOperation({
    description: 'Creates a part of speech.',
    summary: 'Create a part of speech',
  })
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: PartOfSpeech })
  @ApiNotFoundResponse({ type: NotFoundError })
  @ApiForbiddenResponse({ type: ForbiddenError })
  @ApiBadRequestResponse({ type: BadRequestError })
  @ApiUnauthorizedResponse({ type: UnauthorizedError })
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

  @ApiOperation({
    description: "Gets all of a language's parts of speech.",
    summary: 'Get all parts of speech',
  })
  @ApiOkResponse({ type: [PartOfSpeech] })
  @ApiNotFoundResponse({ type: NotFoundError })
  @Get()
  async findAll(@Param('lang_id') langId: string) {
    return this.partOfSpeechService.findAll(langId)
  }

  @ApiOperation({
    description: 'Get a specific part of speech from a language.',
    summary: 'Get a part of speech',
  })
  @ApiOkResponse({ type: PartOfSpeech })
  @ApiNotFoundResponse({ type: NotFoundError })
  @Get(':abbreviation')
  async findOne(
    @Param('abbreviation') abbreviation: string,
    @Param('lang_id') langId: string,
  ) {
    return this.partOfSpeechService.findOne(langId, abbreviation)
  }

  @ApiOperation({
    description: 'Updates a part of speech.',
    summary: 'Update a part of speech',
  })
  @ApiBody({ type: UpdatePartOfSpeechSwaggerDto })
  @ApiBearerAuth()
  @ApiOkResponse({ type: PartOfSpeech })
  @ApiNotFoundResponse({ type: NotFoundError })
  @ApiForbiddenResponse({ type: ForbiddenError })
  @ApiBadRequestResponse({ type: BadRequestError })
  @ApiUnauthorizedResponse({ type: UnauthorizedError })
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

  @ApiOperation({
    description: 'Deletes a part of speech.',
    summary: 'Delete a part of speech',
  })
  @ApiBearerAuth()
  @ApiOkResponse({ type: DeleteSuccess })
  @ApiNotFoundResponse({ type: NotFoundError })
  @ApiForbiddenResponse({ type: ForbiddenError })
  @ApiBadRequestResponse({ type: BadRequestError })
  @ApiUnauthorizedResponse({ type: UnauthorizedError })
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
