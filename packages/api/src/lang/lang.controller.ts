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
  UseInterceptors,
  UploadedFile,
  ForbiddenException,
} from '@nestjs/common'
import { Request } from 'express'
import { CreateLangDto } from './dto/create-lang.dto'
import { UpdateLangDto } from './dto/update-lang.dto'
import { LangService } from './lang.service'
import { ApiPaginated, getLimitAndCursor, pagedSchema } from '../paginator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { getReqUser } from '../auth/checkUser'
import { getUserPermissions } from '../lang-permissions/lang-permissions.service'
import { FileInterceptor } from '@nestjs/platform-express'
import { multerSettings, S3File, validateFile } from '../s3'
import { ALLOWED_TYPES, FLAG_MAX_HEIGHT, FLAG_MAX_WIDTH } from '../constants'
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConflictResponse, ApiConsumes, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiProperty, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger'
import {Lang} from './entities/lang.entity'
import {BadRequestError, ConflictError, ForbiddenError, NotFoundError, UnauthorizedError} from 'src/errors'
import {DeleteSuccess} from 'src/deleteSuccess'

const flagSettings = {
  maxWidth: FLAG_MAX_WIDTH,
  maxHeight: FLAG_MAX_HEIGHT,
}

class Flag {
  @ApiProperty({
    example: 'https://my-bucket.s3.us-west-2.amazonaws.com/0UfVPsLpvMaaJMg11o8GR'
  })
  flag: string
}

class FlagUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  flag: any
}

@ApiTags('Languages')
@Controller()
export class LangController {
  constructor(private readonly langService: LangService) {}
  
  @ApiOperation({
    description: 'Creates a language.',
    summary: 'Create a language',
  })
  @ApiCreatedResponse({ type: Lang })
  @ApiUnauthorizedResponse({ type: UnauthorizedError })
  @ApiForbiddenResponse({ type: ForbiddenError })
  @ApiBadRequestResponse({ type: BadRequestError })
  @ApiConflictResponse({ type: ConflictError })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createLangDto: CreateLangDto, @Req() req: Request) {
    const { username } = getReqUser(req)
    return this.langService.create(createLangDto, username)
  }

  @ApiOperation({
    description: 'Gets all languages, with pagination.',
    summary: 'Get all languages'
  })
  @ApiOkResponse(pagedSchema(Lang))
  @Get()
  async findAll(@Req() req: Request) {
    const { limit, cursor } = getLimitAndCursor(req)
    return this.langService.findAll(limit, cursor)
  }

  @ApiOperation({
    description: 'Finds a language by its id.',
    summary: 'Find a language'
  })
  @ApiPaginated()
  @ApiOkResponse({ type: Lang })
  @ApiNotFoundResponse({type: NotFoundError })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.langService.findOne(id)
  }

  @ApiOperation({
    description: 'Updates a language.',
    summary: 'Update a language'
  })
  @ApiBadRequestResponse({ type: BadRequestError })
  @ApiUnauthorizedResponse({ type: UnauthorizedError })
  @ApiForbiddenResponse({ type: ForbiddenError })
  @ApiConflictResponse({ type: ConflictError })
  @ApiBearerAuth()
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

  @ApiOperation({
    description: 'Deletes a language forever.',
    summary: 'Delete a language'
  })
  @ApiOkResponse({ type: DeleteSuccess })
  @ApiUnauthorizedResponse({ type: UnauthorizedError })
  @ApiForbiddenResponse({ type: ForbiddenError })
  @ApiNotFoundResponse({ type: NotFoundError })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
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
  @ApiOperation({
    description: 'Gets the flag for a language.',
    summary: 'Get a flag'
  })
  @ApiOkResponse({ type: Flag })
  @ApiNotFoundResponse({ type: NotFoundError })
  @Get(':id/flag')
  async getFlag(@Param('id') id: string) {
    const { flag } = await this.findOne(id)
    return { flag }
  }

  @ApiOperation({
    description: 'Adds a flag for a language.',
    summary: 'Create a flag'
  })
  @ApiUnauthorizedResponse({ type: UnauthorizedError })
  @ApiForbiddenResponse({ type: ForbiddenError })
  @ApiNotFoundResponse({ type: NotFoundError })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'The flag to be used',
    type: FlagUploadDto
  })
  @ApiBearerAuth()
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

  @ApiOperation({
    description: 'Updates a flag for a language.',
    summary: 'Update a flag'
  })
  @ApiUnauthorizedResponse({ type: UnauthorizedError })
  @ApiForbiddenResponse({ type: ForbiddenError })
  @ApiNotFoundResponse({ type: NotFoundError })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'The flag to be used',
    type: FlagUploadDto
  })
  @ApiBearerAuth()
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

  @ApiOperation({
    description: 'Removes a flag from a language.',
    summary: 'Remove a flag'
  })
  @ApiOkResponse({ type: DeleteSuccess })
  @ApiUnauthorizedResponse({ type: UnauthorizedError })
  @ApiForbiddenResponse({ type: ForbiddenError })
  @ApiNotFoundResponse({ type: NotFoundError })
  @ApiBearerAuth()
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
