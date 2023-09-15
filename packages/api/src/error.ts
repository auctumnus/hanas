import { NextFunction } from 'express'
import { ZodError } from 'zod'
import { error } from '@hanas-app/backend-shared'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

export const { err } = error

export const handleCreateErr = (model: string, e: any, next: NextFunction) => {
  if (e instanceof PrismaClientKnownRequestError) {
    if (e.code === 'P2002') {
      // This property always exists, by Prisma docs.
      // @ts-ignore
      const target = e.meta.target[0]
      next(err(400, `A ${model} with that ${target} already exists.`))
    }
  } else if (e instanceof ZodError) {
    next(err(400, e))
  } else {
    next(err(500, e))
  }
}
