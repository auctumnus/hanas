import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Patch,
  Req,
  BadRequestException,
} from '@nestjs/common'
import { Request } from 'express'
import { CreateLangDto } from './dto/create-lang.dto'
import { UpdateLangDto } from './dto/update-lang.dto'
import { Lang } from './entities/lang.entity'
import { LangService } from './lang.service'
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../constants'

@Controller('lang')
export class LangController {
  constructor(private readonly langService: LangService) {}

  @Post()
  create(@Body() createLangDto: CreateLangDto): Promise<Lang> {
    return this.langService.create(createLangDto)
  }

  @Get()
  findAll(@Req() req: Request) {
    const limit = +req.query.limit || DEFAULT_PAGE_SIZE
    if (limit > MAX_PAGE_SIZE) {
      throw new BadRequestException(
        `Limit for returned number of objects is ${MAX_PAGE_SIZE}.`,
      )
    }

    let cursor: string
    if (req.query.cursor && typeof req.query.cursor === 'string') {
      cursor = req.query.cursor
    } else if (req.query.cursor) {
      throw new BadRequestException('Cursor must be a string.')
    }

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
