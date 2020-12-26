import { Injectable } from '@nestjs/common'
import { CreateWordClassDto } from './dto/create-word-class.dto'
import { UpdateWordClassDto } from './dto/update-word-class.dto'

@Injectable()
export class WordClassService {
  create(createWordClassDto: CreateWordClassDto) {
    return 'This action adds a new wordClass'
  }

  findAll() {
    return `This action returns all wordClass`
  }

  findOne(id: number) {
    return `This action returns a #${id} wordClass`
  }

  update(id: number, updateWordClassDto: UpdateWordClassDto) {
    return `This action updates a #${id} wordClass`
  }

  remove(id: number) {
    return `This action removes a #${id} wordClass`
  }
}
