import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '../user/entities/user.entity'
import { Repository } from 'typeorm'
import { CreateSessionDto } from './dto/create-session.dto'
import { Session } from './entities/session.entity'
import { nanoid } from 'nanoid'
import { AuthService } from '../auth/auth.service'
import { UAParser } from 'ua-parser-js'
import { REFRESH_JWT_SECRET, SALT_ROUNDS } from '../constants'
import * as bcrypt from 'bcrypt'
import { classToClass } from 'class-transformer'
import { RefreshSessionDto } from './dto/refresh-session.dto'
import { JwtService } from '@nestjs/jwt'
import { UserService } from 'src/user/user.service'
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken'

const getBrowserIdentifier = (uaparser: UAParser) => {
  const parsedUA = uaparser.getResult()
  const { name, version } = parsedUA.browser
  return (name || '') + (version || '') || 'Unknown browser'
}

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    private authService: AuthService,
    private jwtService: JwtService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}
  async create(createSessionDto: CreateSessionDto, uaparser: UAParser) {
    const { username, password } = createSessionDto
    console.log(createSessionDto)
    const user = await this.authService.validateUser(username, password)
    if (user === null) {
      throw new UnauthorizedException('Password is incorrect.')
    }
    const { accessToken, refreshToken } = await this.authService.login(user)
    const parsedUA = uaparser.getResult()
    const os = parsedUA.os.name || 'Unknown OS'
    const browser = getBrowserIdentifier(uaparser)
    const id = nanoid()
    const hash = await bcrypt.hash(refreshToken, SALT_ROUNDS)
    await this.sessionRepository.save({ id, user, hash, os, browser })
    return {
      user: classToClass(user),
      accessToken,
      refresh: {
        refreshToken,
        id,
      },
    }
  }

  async findOne(id: string, user: User) {
    const { internal_id } = user
    return this.sessionRepository
      .createQueryBuilder('session')
      .where('session.userInternalId = :internal_id', { internal_id })
      .andWhere('session.id = :id', { id })
      .getOne()
  }

  async refresh(refreshSessionDto: RefreshSessionDto) {
    const { id, refreshToken } = refreshSessionDto
    // verify token
    let decoded
    try {
      decoded = this.jwtService.verify(refreshToken, {
        secret: REFRESH_JWT_SECRET,
      })
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw new UnauthorizedException('Expired token.')
      } else if (err instanceof JsonWebTokenError) {
        throw new BadRequestException(`Invalid token: "${err.message}"`)
      } else {
        throw new BadRequestException('Invalid token.')
      }
    }

    // ensure user isn't incorrect / forged somehow
    const { username } = decoded
    const user = await this.userService.findOne(username)
    if (!(user.internal_id === decoded.sub)) {
      throw new BadRequestException('Invalid token.')
    }

    // verify session exists
    const session = await this.findOne(id, user)
    if (!session) {
      throw new NotFoundException('No session found by that id/user.')
    }

    // ensure token matches session token hash
    const { hash } = session
    if (!(await bcrypt.compare(refreshToken, hash))) {
      throw new UnauthorizedException('Invalid token.')
    }

    // send a new access token to the user
    return { accessToken: this.authService.makeAccessToken(user) }
  }

  findAll(user: User) {
    return this.sessionRepository
      .createQueryBuilder('session')
      .where('session.userInternalId = :id', { id: user.internal_id })
      .getMany()
  }

  async remove(user: User, id: string) {
    if (await this.findOne(id, user)) {
      this.sessionRepository.delete({ id })
    }
  }

  async removeByUser(user: User) {
    this.sessionRepository
      .createQueryBuilder('session')
      .delete()
      .from(Session)
      .where('session.userInternalId = :id', { id: user.internal_id })
      .execute()
  }
}
