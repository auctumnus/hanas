import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { QueryFailedError, Repository } from 'typeorm'
import { Lang } from './entities/lang.entity'
import { CreateLangDto } from './dto/create-lang.dto'
import { UpdateLangDto } from './dto/update-lang.dto'
import { paginator } from '../paginator'
import { LangPermissions } from '../lang-permissions/entities/lang-permissions.entity'
import { UserService } from '../user/user.service'
import { deleteObject, getUrl, S3File } from '../s3'

const idInUse = new ConflictException('Language ID is already in use.')

@Injectable()
export class LangService {
  constructor(
    @InjectRepository(Lang)
    private langRepository: Repository<Lang>,

    @InjectRepository(LangPermissions)
    private permsRepository: Repository<LangPermissions>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async create(createLangDto: CreateLangDto, username: string): Promise<Lang> {
    if (await this.langRepository.findOne({ id: createLangDto.id })) {
      throw idInUse
    }
    const user = await this.userService.findOne(username)
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
      .leftJoinAndSelect('lang.partsOfSpeech', 'partsOfSpeech')
      .leftJoinAndSelect('lang.wordClasses', 'wordClasses')
      .leftJoinAndSelect('permissions.user', 'user')
    return paginator(Lang, qb, 'internal_id', limit, cursor)
  }

  async findOne(id: string) {
    const lang = await this.langRepository
      .createQueryBuilder('lang')
      .leftJoinAndSelect('lang.permissions', 'permissions')
      .leftJoinAndSelect('lang.partsOfSpeech', 'partsOfSpeech')
      .leftJoinAndSelect('lang.wordClasses', 'wordClasses')
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

  async createFlag(lang: Lang, file: S3File) {
    if (lang.flag) {
      deleteObject(lang.flag)
    }
    const { id } = lang
    const flag = getUrl(file)
    await this.langRepository.update({ id }, { flag })
    return this.findOne(id)
  }
  async removeFlag(lang: Lang) {
    if (!lang.flag) {
      throw new NotFoundException('No flag exists for this language.')
    }
    deleteObject(lang.flag)
    const { id } = lang
    await this.langRepository.update({ id }, { flag: '' })
  }
}
