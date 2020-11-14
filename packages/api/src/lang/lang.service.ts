import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { QueryFailedError, Repository } from 'typeorm'
import { Lang } from './entities/lang.entity'
import { CreateLangDto } from './dto/create-lang.dto'
import { UpdateLangDto } from './dto/update-lang.dto'
import { classToClass } from 'class-transformer'

const idInUse = new ConflictException('Language ID is already in use.')

@Injectable()
export class LangService {
  constructor(
    @InjectRepository(Lang)
    private langRepository: Repository<Lang>,
  ) {}

  async create(createLangDto: CreateLangDto): Promise<Lang> {
    if (await this.langRepository.findOne({ id: createLangDto.id })) {
      throw idInUse
    }
    return classToClass(
      await this.langRepository.save({ ...new Lang(), ...createLangDto }),
    )
  }

  async findAll() {
    // .filter((l) => l) removes any possible undefined values
    return (await this.langRepository.find())
      .filter((l) => l)
      .map((l) => classToClass(l))
  }

  async findOne(id: string) {
    const lang = await this.langRepository.findOne({ id })
    if (!lang) throw new NotFoundException()
    return classToClass(lang)
  }

  async update(id: string, updateLangDto: UpdateLangDto) {
    if (Object.keys(updateLangDto).length === 0) {
      return { message: 'No valid parameters were provided.' }
    }
    if (await this.findOne(id)) {
      try {
        await this.langRepository.update({ id }, updateLangDto)
      } catch (err) {
        if (err instanceof QueryFailedError && err.message.includes('UNIQUE')) {
          throw idInUse
        }
      }
      return this.findOne(id)
    }
  }

  async remove(id: string) {
    if (await this.findOne(id)) {
      await this.langRepository.delete({ id })
    }
  }
}
