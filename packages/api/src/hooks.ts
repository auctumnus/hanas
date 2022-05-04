import { Router } from 'express'
import { KRATOS_API_KEY } from './env'
import { err } from './error'
import { prisma } from './db'
import { username } from './user/dto'

interface KratosAfterHookResponse {
  user: {
    id: string
    traits: {
      username: string
    }
  }
}

export const hooks = Router()
  // This is just so Kratos actually ensures there's a server here before
  // allowing you to register. The response doesn't matter at all.
  .post('/kratos/before_registration', (_, res) =>
    res.status(200).json({ yep: 'yeah' })
  )
  // This one will eventually have an actual purpose, so it needs to be protected.
  .post('/kratos/after_registration', (req, res, next) => {
    if (req.header('x-kratos-key') !== KRATOS_API_KEY) {
      next(err(401, 'This endpoint is only intended for use by Kratos.'))
    } else {
      const { user } = req.body as KratosAfterHookResponse
      if (!username.safeParse(user.traits.username).success) {
        // TODO: Once https://github.com/ory/kratos/pull/1585 is merged and in
        // a Kratos release, this can be a lot better.
        // At the moment this also technically does nothing for the Kratos end.
        res.status(400).json({ error: true, message: 'bad username lol' })
      } else {
        prisma.user
          .create({
            data: {
              username: user.traits.username,
              kratosID: user.id,
            },
          })
          .then(() => res.status(200).json({ yep: 'yeah' }))
          .catch((error: Error) => next(err(500, error.message)))
      }
    }
  })
