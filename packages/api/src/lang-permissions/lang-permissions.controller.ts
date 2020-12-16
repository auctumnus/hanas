import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  Req,
  ForbiddenException,
  MethodNotAllowedException,
} from '@nestjs/common'
import { Request } from 'express'
import { LangPermissionsService } from './lang-permissions.service'
import { CreateLangPermissionDto } from './dto/create-lang-permission.dto'
import { UpdateLangPermissionDto } from './dto/update-lang-permission.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { LangService } from '../lang/lang.service'
import { UserService } from '../user/user.service'
import { HanasRequest } from '../auth/checkUser'
import { Lang } from '../lang/entities/lang.entity'

@Controller()
export class LangPermissionsController {
  constructor(
    private readonly langPermissionsService: LangPermissionsService,
    private readonly langService: LangService,
    private readonly userService: UserService,
  ) {}

  checkPermission(username: string, lang: Lang) {
    const [permissions] = lang.permissions.filter(
      (perm) => perm.user.username === username,
    )
    if (!(permissions && permissions.changePermissions)) {
      throw new ForbiddenException(
        "User does not have permission to access or change the requested language's permissions.",
      )
    }
  }

  @Post()
  methodNotAllowed() {
    throw new MethodNotAllowedException(
      'Use /lang/:id/permissions/:username instead.',
    )
  }

  @UseGuards(JwtAuthGuard)
  @Post(':username')
  async create(
    @Param('username') username: string,
    @Param('lang_id') langId: string,
    @Body() createLangPermissionDto: CreateLangPermissionDto,
    @Req() req: Request,
  ) {
    const lang = await this.langService.findOne(langId)
    const requestorUsername = ((req as unknown) as HanasRequest).user.username
    this.checkPermission(requestorUsername, lang)
    const user = await this.userService.findOne(username)
    return this.langPermissionsService.create(
      createLangPermissionDto,
      lang,
      user,
      requestorUsername,
    )
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Param('lang_id') langId: string, @Req() req: Request) {
    const lang = await this.langService.findOne(langId)
    const username = ((req as unknown) as HanasRequest).user.username
    this.checkPermission(username, lang)
    return this.langPermissionsService.findAll(lang)
  }

  @UseGuards(JwtAuthGuard)
  @Get(':username')
  async findOne(
    @Param('lang_id') langId: string,
    @Param('username') username: string,
    @Req() req: Request,
  ) {
    const lang = await this.langService.findOne(langId)
    const requestorUsername = ((req as unknown) as HanasRequest).user.username
    this.checkPermission(requestorUsername, lang)
    return this.langPermissionsService.findOne(lang, username)
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':username')
  async update(
    @Param('lang_id') langId: string,
    @Param('username') username: string,
    @Body() updateLangPermissionDto: UpdateLangPermissionDto,
    @Req() req: Request,
  ) {
    const lang = await this.langService.findOne(langId)
    const requestorUsername = ((req as unknown) as HanasRequest).user.username
    this.checkPermission(requestorUsername, lang)
    return this.langPermissionsService.update(
      updateLangPermissionDto,
      lang,
      username,
      requestorUsername,
    )
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':username')
  async remove(
    @Param('lang_id') langId: string,
    @Param('username') username: string,
    @Req() req: Request,
  ) {
    const lang = await this.langService.findOne(langId)
    const requestorUsername = ((req as unknown) as HanasRequest).user.username
    this.checkPermission(requestorUsername, lang)
    return this.langPermissionsService.remove(lang, username, requestorUsername)
  }
}
