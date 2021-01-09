import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { UserService } from '../user/user.service'
import { compare } from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { User } from '../user/entities/user.entity'
import {
  ACCESS_JWT_SECRET,
  REFRESH_JWT_SECRET,
  ACCESS_JWT_DURATION,
  REFRESH_JWT_DURATION,
} from '../constants'

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private jwtService: JwtService,
  ) {}
  async validateUser(username: string, password: string) {
    const user = await this.userService.findOne(username)
    if (await compare(password, user.password_hash)) {
      return user
    } else {
      return null
    }
  }
  async login(user: User) {
    return {
      accessToken: this.makeAccessToken(user),
      refreshToken: this.makeRefreshToken(user),
    }
  }
  makePayload(user: User) {
    return { username: user.username, sub: user.internal_id }
  }
  makeAccessToken(user: User) {
    return this.jwtService.sign(this.makePayload(user), {
      secret: ACCESS_JWT_SECRET,
      expiresIn: ACCESS_JWT_DURATION,
    })
  }
  makeRefreshToken(user: User) {
    return this.jwtService.sign(this.makePayload(user), {
      secret: REFRESH_JWT_SECRET,
      expiresIn: REFRESH_JWT_DURATION,
    })
  }
}
