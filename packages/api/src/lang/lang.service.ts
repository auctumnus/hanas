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
import { paginator } from '../paginator'
import { User } from '../user/entities/user.entity'
import { LangPermissions } from '../lang-permissions/entities/lang-permissions.entity'

const idInUse = new ConflictException('Language ID is already in use.')

@Injectable()
export class LangService {
  constructor(
    @InjectRepository(Lang)
    private langRepository: Repository<Lang>,

    @InjectRepository(LangPermissions)
    private permsRepository: Repository<LangPermissions>,
  ) {}

  async create(createLangDto: CreateLangDto, user: User): Promise<Lang> {
    if (await this.langRepository.findOne({ id: createLangDto.id })) {
      throw idInUse
    }

    const lang = await this.langRepository.save({
      ...createLangDto,
      owners: [user],
    })

    await this.permsRepository.save({
      user,
      lang,
      owner: true,
      changePermissions: true,
      changeId: true,
      changeInfo: true,
      changeWords: true,
    })

    return this.findOne(lang.id)
  }

  async findAll(limit: number, cursor?: string) {
    const qb = this.langRepository
      .createQueryBuilder('lang')
      .leftJoinAndSelect('lang.permissions', 'permissions')
      .leftJoinAndSelect('permissions.user', 'user')
    return paginator(Lang, qb, 'internal_id', limit, cursor)
  }

  async findOne(id: string) {
    const lang = await this.langRepository
      .createQueryBuilder('lang')
      .leftJoinAndSelect('lang.permissions', 'permissions')
      .leftJoinAndSelect('permissions.user', 'user')
      .where('lang.id = :id', { id: id.toLowerCase() })
      .getOne()
    if (!lang) throw new NotFoundException()
    return lang
  }

  async update(id: string, updateLangDto: UpdateLangDto) {
    if (Object.keys(updateLangDto).length === 0) {
      return { message: 'No valid parameters were provided.' }
    }
    try {
      await this.langRepository.update({ id }, updateLangDto)
    } catch (err) {
      if (err instanceof QueryFailedError && err.message.includes('UNIQUE')) {
        throw idInUse
      }
    }
    return this.findOne(id)
  }

  async remove(id: string) {
    this.langRepository.delete({ id })
  }
}
