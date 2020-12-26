import { Injectable } from '@nestjs/common'
import { CreatePartOfSpeechDto } from './dto/create-part-of-speech.dto'
import { UpdatePartOfSpeechDto } from './dto/update-part-of-speech.dto'

@Injectable()
export class PartOfSpeechService {
  create(createPartOfSpeechDto: CreatePartOfSpeechDto) {
    return 'This action adds a new partOfSpeech'
  }

  findAll() {
    return `This action returns all partOfSpeech`
  }

  findOne(id: number) {
    return `This action returns a #${id} partOfSpeech`
  }

  update(id: number, updatePartOfSpeechDto: UpdatePartOfSpeechDto) {
    return `This action updates a #${id} partOfSpeech`
  }

  remove(id: number) {
    return `This action removes a #${id} partOfSpeech`
  }
}
