import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common'
import { PartOfSpeechService } from './part-of-speech.service'
import { CreatePartOfSpeechDto } from './dto/create-part-of-speech.dto'
import { UpdatePartOfSpeechDto } from './dto/update-part-of-speech.dto'

@Controller('part-of-speech')
export class PartOfSpeechController {
  constructor(private readonly partOfSpeechService: PartOfSpeechService) {}

  @Post()
  create(@Body() createPartOfSpeechDto: CreatePartOfSpeechDto) {
    return this.partOfSpeechService.create(createPartOfSpeechDto)
  }

  @Get()
  findAll() {
    return this.partOfSpeechService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.partOfSpeechService.findOne(+id)
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updatePartOfSpeechDto: UpdatePartOfSpeechDto,
  ) {
    return this.partOfSpeechService.update(+id, updatePartOfSpeechDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.partOfSpeechService.remove(+id)
  }
}
