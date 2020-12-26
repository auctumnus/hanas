import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common'
import { WordClassService } from './word-class.service'
import { CreateWordClassDto } from './dto/create-word-class.dto'
import { UpdateWordClassDto } from './dto/update-word-class.dto'

@Controller('word-class')
export class WordClassController {
  constructor(private readonly wordClassService: WordClassService) {}

  @Post()
  create(@Body() createWordClassDto: CreateWordClassDto) {
    return this.wordClassService.create(createWordClassDto)
  }

  @Get()
  findAll() {
    return this.wordClassService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wordClassService.findOne(+id)
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateWordClassDto: UpdateWordClassDto,
  ) {
    return this.wordClassService.update(+id, updateWordClassDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.wordClassService.remove(+id)
  }
}
