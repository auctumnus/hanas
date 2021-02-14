import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common'
import { MediaService } from './media.service'
import { CreateMediaDto } from './dto/create-media.dto'
import { UpdateMediaDto } from './dto/update-media.dto'

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  create(@Body() createMediaDto: CreateMediaDto) {
    return this.mediaService.create(createMediaDto)
  }

  @Get()
  findAll() {
    return this.mediaService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mediaService.findOne(+id)
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateMediaDto: UpdateMediaDto) {
    return this.mediaService.update(+id, updateMediaDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mediaService.remove(+id)
  }
}
