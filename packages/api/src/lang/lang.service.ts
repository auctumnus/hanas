import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Lang } from './entities/lang.entity'
import { CreateLangDto } from './dto/create-lang.dto'
import { removeProps } from '../removeProps'
import { UpdateLangDto } from './dto/update-lang.dto'

const toRemove = ['internal_id']
const fix = (lang?: Lang) => (lang ? removeProps(lang, toRemove) : undefined)

@Injectable()
export class LangService {
  constructor(
    @InjectRepository(Lang)
    private langRepository: Repository<Lang>,
  ) {}

  async create(createLangDto: CreateLangDto): Promise<Lang> {
    if (await this.langRepository.findOne({ id: createLangDto.id })) {
      throw new ConflictException()
    }
    return fix(
      await this.langRepository.save({ ...new Lang(), ...createLangDto }),
    )
  }

  async findAll() {
    // .filter((l) => l) removes any possible undefined values
    return (await this.langRepository.find()).map(fix).filter((l) => l)
  }

  async findOne(id: string) {
    const lang = await this.langRepository.findOne({ id })
    if (!lang) throw new NotFoundException()
    return fix(lang)
  }

  async update(id: string, updateLangDto: UpdateLangDto) {
    if (Object.keys(updateLangDto).length === 0) {
      return { message: 'No valid parameters were provided.' }
    }
    if (await this.findOne(id)) {
      await this.langRepository.update({ id }, updateLangDto)
      return this.findOne(id)
    }
  }

  async remove(id: string) {
    if (await this.findOne(id)) {
      await this.langRepository.delete({ id })
    }
  }
}
