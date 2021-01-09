import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { QueryFailedError, Repository } from 'typeorm'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User } from './entities/user.entity'
import * as bcrypt from 'bcrypt'
import { plainToClass } from 'class-transformer'
import { SALT_ROUNDS } from '../constants'
import { paginator } from '../paginator'
import { SessionService } from '../session/session.service'
import { LangService } from '../lang/lang.service'

const usernameInUse = new ConflictException('Username is already in use.')

const hash = (password: string) => bcrypt.hash(password, SALT_ROUNDS)

interface UpdateUserDtoWithHash extends Omit<UpdateUserDto, 'password'> {
  password_hash?: string
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(forwardRef(() => SessionService))
    private sessionService: SessionService,
    @Inject(forwardRef(() => LangService))
    private langService: LangService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    // eslint-disable-next-line prefer-const
    let { display_name, username, password } = createUserDto
    if (!display_name) {
      display_name = username
    }
    if (await this.userRepository.findOne({ username })) {
      throw usernameInUse
    }
    const password_hash = await hash(password)
    return plainToClass(
      User,
      await this.userRepository.save({ display_name, username, password_hash }),
    )
  }

  findAll(limit: number, cursor?: string) {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.langPermissions', 'permissions')
      .leftJoinAndSelect('permissions.lang', 'lang')
    return paginator(User, qb, 'username', limit, cursor)
  }

  async findOne(username: string) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.username = :username', { username })
      .leftJoinAndSelect('user.langPermissions', 'permissions')
      .leftJoinAndSelect('permissions.lang', 'lang')
      .getOne()
    if (!user) throw new NotFoundException()
    return user
  }

  async update(username: string, updateUserDto: UpdateUserDto) {
    if (Object.keys(updateUserDto).length === 0) {
      return { message: 'No valid parameters were provided.' }
    }
    // deal with password updating
    let newUpdateDto: UpdateUserDtoWithHash
    if (await this.findOne(username)) {
      // if the update object includes a password...
      if (updateUserDto.password) {
        // hash the password,
        const password_hash = await hash(updateUserDto.password)
        // remove the password property,
        // delete updateUserDto.password
        // and add the hash to the new dto
        newUpdateDto = { ...updateUserDto, password_hash }
      } else {
        // otherwise, we don't need to deal with the password
        newUpdateDto = updateUserDto
      }
      try {
        await this.userRepository.update({ username }, newUpdateDto)
      } catch (err) {
        if (err instanceof QueryFailedError && err.message.includes('UNIQUE')) {
          throw usernameInUse
        }
      }
      const currentUsername = updateUserDto.username
        ? updateUserDto.username
        : username
      return this.findOne(currentUsername)
    }
  }

  async remove(username: string) {
    const user = await this.findOne(username)
    if (user) {
      user.ownedLangs.forEach(({ id }) => this.langService.remove(id))
      this.userRepository.delete({ username })
      this.sessionService.removeByUser(user)
    }
  }
}
