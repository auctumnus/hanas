import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Patch,
  Req,
} from '@nestjs/common'
import { Request } from 'express'
import { CreateLangDto } from './dto/create-lang.dto'
import { UpdateLangDto } from './dto/update-lang.dto'
import { Lang } from './entities/lang.entity'
import { LangService } from './lang.service'
import { getLimitAndCursor } from '../paginator'

@Controller()
export class LangController {
  constructor(private readonly langService: LangService) {}

  @Post()
  create(@Body() createLangDto: CreateLangDto): Promise<Lang> {
    return this.langService.create(createLangDto)
  }

  @Get()
  findAll(@Req() req: Request) {
    const { limit, cursor } = getLimitAndCursor(req)
    return this.langService.findAll(limit, cursor)
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Lang> {
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
