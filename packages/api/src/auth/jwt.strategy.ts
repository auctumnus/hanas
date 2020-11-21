import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { ACCESS_JWT_SECRET } from '../constants'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: ACCESS_JWT_SECRET,
    })
  }

  async validate(payload: any) {
    return { internal_id: payload.sub, username: payload.username }
  }
}
