import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Lang } from '../lang/entities/lang.entity'
import { LangService } from '../lang/lang.service'
import { Repository } from 'typeorm'
import { CreatePartOfSpeechDto } from './dto/create-part-of-speech.dto'
import { UpdatePartOfSpeechDto } from './dto/update-part-of-speech.dto'
import { PartOfSpeech } from './entities/part-of-speech.entity'

const getPos = (lang: Lang, abbreviation: string) =>
  lang.partsOfSpeech.filter((p) => p.abbreviation === abbreviation)[0]

const notFound = () => {
  throw new NotFoundException(
    'Could not find a part of speech with that abbreviation for the given language.',
  )
}

const checkIfTaken = (lang: Lang, name: string, abbreviation: string) => {
  if (lang.partsOfSpeech.some((pos) => pos.name === name)) {
    throw new ConflictException(
      'A part of speech with that name already exists.',
    )
  } else if (
    lang.partsOfSpeech.some((pos) => pos.abbreviation === abbreviation)
  ) {
    throw new ConflictException(
      'A part of speech with that abbreviation already exists.',
    )
  }
}
@Injectable()
export class PartOfSpeechService {
  constructor(
    private readonly langService: LangService,

    @InjectRepository(PartOfSpeech)
    private posRepository: Repository<PartOfSpeech>,
  ) {}
  async create(lang: Lang, createPartOfSpeechDto: CreatePartOfSpeechDto) {
    const { name, abbreviation } = createPartOfSpeechDto
    checkIfTaken(lang, name, abbreviation)
    await this.posRepository.save({
      lang,
      ...createPartOfSpeechDto,
    })
    return this.findOne(lang.id, abbreviation)
  }

  async findAll(langId: string) {
    const lang = await this.langService.findOne(langId)
    return lang.partsOfSpeech
  }

  async findOne(langId: string, abbreviation: string) {
    const lang = await this.langService.findOne(langId)
    const partOfSpeech = getPos(lang, abbreviation)
    if (!partOfSpeech) {
      notFound()
    } else {
      return partOfSpeech
    }
  }

  async update(
    lang: Lang,
    abbreviation: string,
    updatePartOfSpeechDto: UpdatePartOfSpeechDto,
  ) {
    const partOfSpeech = getPos(lang, abbreviation)
    if (!partOfSpeech) {
      notFound()
    }
    checkIfTaken(
      lang,
      updatePartOfSpeechDto.name,
      updatePartOfSpeechDto.abbreviation,
    )
    const { internal_id } = partOfSpeech
    await this.posRepository.update({ internal_id }, updatePartOfSpeechDto)
    return this.findOne(
      lang.id,
      updatePartOfSpeechDto.abbreviation || abbreviation,
    )
  }

  async remove(lang: Lang, abbreviation: string) {
    const partOfSpeech = getPos(lang, abbreviation)
    if (!partOfSpeech) {
      notFound()
    }
    const { internal_id } = partOfSpeech
    await this.posRepository.delete({ internal_id })
  }
}
