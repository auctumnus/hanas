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
} from '@nestjs/common'
import { Request } from 'express'
import { CreateLangDto } from './dto/create-lang.dto'
import { UpdateLangDto } from './dto/update-lang.dto'
import { Lang } from './entities/lang.entity'
import { LangService } from './lang.service'
import { getLimitAndCursor } from '../paginator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { UserService } from '../user/user.service'
import { HanasRequest } from '../auth/checkUser'
import { classToClass } from 'class-transformer'

const convertPermissionsToOwners = (lang: Lang) => {
  const langWithOwners = {
    ...lang,
    owners: lang.permissions.map((perm) => perm.user),
  }
  delete langWithOwners.permissions
  return langWithOwners
}

@Controller()
export class LangController {
  constructor(
    private readonly langService: LangService,
    private userService: UserService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createLangDto: CreateLangDto, @Req() req: Request) {
    const user = await this.userService.findOne(
      (req as HanasRequest).user.username,
    )
    return this.langService.create(createLangDto, user)
  }

  @Get()
  async findAll(@Req() req: Request) {
    const { limit, cursor } = getLimitAndCursor(req)
    return this.langService.findAll(limit, cursor)
    /*  const convertedLangs = ((langs.data as unknown) as Lang[]).map(
      convertPermissionsToOwners,
    )
    return {
      data: classToClass(convertedLangs),
      cursor: langs.cursor,
    } */
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.langService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLangDto: UpdateLangDto) {
    return this.langService.update(id, updateLangDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.langService.remove(id)
  }
}
