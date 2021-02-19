import { ForbiddenException, UnauthorizedException } from '@nestjs/common'
import { Request } from 'express'
import { Lang } from '../lang/entities/lang.entity'
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
    throw new ForbiddenException(
      'User does not have access to requested resource.',
    )
  }
}

export const getReqUser = (req: Request) => (req as HanasRequest).user

export const getPermission = (req: Request, lang: Lang) => {
  if (!getReqUser(req)) throw new UnauthorizedException()
  const username = getReqUser(req).username
  if (!lang.permissions || lang.permissions.length < 1) return null
  const permissions = lang.permissions.filter(
    (p) => p?.user.username === username,
  )
  return permissions[0] || null
}
