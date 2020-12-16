import { UnauthorizedException } from '@nestjs/common'
import { Request } from 'express'
import { User } from '../user/entities/user.entity'

export interface HanasRequest extends Request {
  user: {
    internal_id: number
    username: string
  }
}

export const checkUser = (req: Request, user: User) => {
  if (!req.user) {
    throw new UnauthorizedException()
  }
  if ((req as HanasRequest).user.internal_id !== user.internal_id) {
    throw new UnauthorizedException(
      'User does not have access to requested resource.',
    )
  }
}

export const getReqUser = (req: Request) => (req as HanasRequest).user
