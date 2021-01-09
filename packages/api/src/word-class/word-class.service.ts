import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Lang } from '../lang/entities/lang.entity'
import { LangService } from '../lang/lang.service'
import { Repository } from 'typeorm'
import { CreateWordClassDto } from './dto/create-word-class.dto'
import { UpdateWordClassDto } from './dto/update-word-class.dto'
import { WordClass } from './entities/word-class.entity'

const getWordClass = (lang: Lang, abbreviation: string) =>
  lang.wordClasses.filter((p) => p.abbreviation === abbreviation)[0]

const notFound = () => {
  throw new NotFoundException(
    'Could not find a word class with that abbreviation for the given language.',
  )
}

const checkIfTaken = (lang: Lang, name: string, abbreviation: string) => {
  if (lang.wordClasses.some((wordClass) => wordClass.name === name)) {
    throw new ConflictException('A word class with that name already exists.')
  } else if (
    lang.wordClasses.some(
      (wordClass) => wordClass.abbreviation === abbreviation,
    )
  ) {
    throw new ConflictException(
      'A word class with that abbreviation already exists.',
    )
  }
}
@Injectable()
export class WordClassService {
  constructor(
    private readonly langService: LangService,

    @InjectRepository(WordClass)
    private wordClassRepository: Repository<WordClass>,
  ) {}
  async create(lang: Lang, createWordClassDto: CreateWordClassDto) {
    const { name, abbreviation } = createWordClassDto
    checkIfTaken(lang, name, abbreviation)
    await this.wordClassRepository.save({
      lang,
      ...createWordClassDto,
    })
    return this.findOne(lang.id, abbreviation)
  }

  async findAll(langId: string) {
    const lang = await this.langService.findOne(langId)
    return lang.wordClasses
  }

  async findOne(langId: string, abbreviation: string) {
    const lang = await this.langService.findOne(langId)
    const wordClass = getWordClass(lang, abbreviation)
    if (!wordClass) {
      notFound()
    } else {
      return wordClass
    }
  }

  async update(
    lang: Lang,
    abbreviation: string,
    updateWordClassDto: UpdateWordClassDto,
  ) {
    const wordClass = getWordClass(lang, abbreviation)
    if (!wordClass) {
      notFound()
    }
    checkIfTaken(lang, updateWordClassDto.name, updateWordClassDto.abbreviation)
    const { internal_id } = wordClass
    await this.wordClassRepository.update({ internal_id }, updateWordClassDto)
    return this.findOne(
      lang.id,
      updateWordClassDto.abbreviation || abbreviation,
    )
  }

  async remove(lang: Lang, abbreviation: string) {
    const wordClass = getWordClass(lang, abbreviation)
    if (!wordClass) {
      notFound()
    }
    const { internal_id } = wordClass
    await this.wordClassRepository.delete({ internal_id })
  }
}
