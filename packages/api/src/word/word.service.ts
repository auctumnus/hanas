import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Lang } from 'src/lang/entities/lang.entity'
import { CreateWordDto } from './dto/create-word.dto'
import { UpdateWordDto } from './dto/update-word.dto'
import { User } from '../user/entities/user.entity'
import { WordClass } from 'src/word-class/entities/word-class.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { paginator } from '../paginator'
import { Word } from './entities/word.entity'

const getPartOfSpeech = (abbreviation: string, lang: Lang) =>
  lang.partsOfSpeech.filter((pos) => pos.abbreviation === abbreviation)[0] ||
  null

const getWordClass = (abbreviation: string, lang: Lang) =>
  lang.wordClasses.filter((wc) => wc.abbreviation === abbreviation)[0] ||
  abbreviation

const getWordClasses = (abbreviations: string[], lang: Lang) => {
  const wordClasses = abbreviations.map((abbreviation) =>
    getWordClass(abbreviation, lang),
  )
  const invalid = wordClasses.filter((wc) => typeof wc === 'string')
  if (invalid.length === 1) {
    throw new BadRequestException(
      'The word class ' + invalid[0] + ' was not found for this language.',
    )
  } else if (invalid.length >= 1) {
    throw new BadRequestException(
      'The following word classes were not found for this language: ' +
        invalid.join(', '),
    )
  } else {
    // typescript can't tell that this function cannot possibly return any
    // strings, so we have to cast it ourselves
    return wordClasses as WordClass[]
  }
}

@Injectable()
export class WordService {
  constructor(
    @InjectRepository(Word)
    private readonly wordRepository: Repository<Word>,
  ) {}

  async create(lang: Lang, creator: User, createWordDto: CreateWordDto) {
    const partOfSpeech = getPartOfSpeech(createWordDto.partOfSpeech, lang)
    if (!partOfSpeech) {
      throw new BadRequestException(
        'No part of speech with that abbreviation was found for this language.',
      )
    }
    let wordClasses = []
    if (createWordDto.wordClasses) {
      wordClasses = getWordClasses(createWordDto.wordClasses, lang)
    }
    await this.wordRepository.save({
      ...createWordDto,
      lang,
      creator,
      partOfSpeech,
      wordClasses,
    })
    return this.findOne(lang.id, createWordDto.word)
  }

  findAll(langId: string, limit: number, cursor?: string) {
    const qb = this.wordRepository
      .createQueryBuilder('word')
      .leftJoinAndSelect('word.lang', 'lang')
      .leftJoinAndSelect('word.partOfSpeech', 'partOfSpeech')
      .leftJoinAndSelect('word.wordClasses', 'wordClasses')
      .leftJoinAndSelect('word.creator', 'creator')
      .where('lang.id = :langId', { langId })
    return paginator(Word, qb, 'internal_id', limit, cursor)
  }

  async findOne(langId: string, word: string) {
    const words = await this.wordRepository
      .createQueryBuilder('word')
      .leftJoinAndSelect('word.lang', 'lang')
      .leftJoinAndSelect('word.creator', 'creator')
      .leftJoinAndSelect('word.partOfSpeech', 'partOfSpeech')
      .leftJoinAndSelect('word.wordClasses', 'wordClasses')
      .where('word.word = :word', { word })
      .andWhere('lang.id = :langId', { langId })
      .getMany()
    if(!words.length) {
      throw new NotFoundException()
    } else {
      return words
    }
  }

  async findOneByNumber(langId: string, word: string, num: number) {
    const words = await this.findOne(langId, word)
    if(!words[num]) {
      throw new NotFoundException()
    } else {
      return words[num]
    }
  }

  async update(
    lang: Lang,
    word: string,
    num: number,
    updateWordDto: UpdateWordDto,
  ) {
    const fullWord = await this.findOneByNumber(lang.id, word, num)
    let partOfSpeech = fullWord.partOfSpeech
    if (updateWordDto.partOfSpeech) {
      partOfSpeech = getPartOfSpeech(updateWordDto.partOfSpeech, lang)
    }
    if (!partOfSpeech) {
      throw new BadRequestException(
        'No part of speech with that abbreviation was found for this language.',
      )
    }

    let wordClasses = fullWord.wordClasses
    if (updateWordDto.wordClasses) {
      wordClasses = getWordClasses(updateWordDto.wordClasses, lang)
    }

    await this.wordRepository.update(
      { internal_id: fullWord.internal_id },
      { ...updateWordDto, partOfSpeech, wordClasses },
    )
    return this.findOneByNumber(
      lang.id,
      fullWord.word || updateWordDto.word,
      num,
    )
  }

  async remove(lang: Lang, word: string, num: number) {
    const fullWord = await this.findOneByNumber(lang.id, word, num)
    await this.wordRepository.delete({ internal_id: fullWord.internal_id })
  }
}
