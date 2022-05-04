import { Router } from 'express'
import { prisma } from './db'
import { err } from './error'
import { URL } from 'url'

export const webfinger = Router().get(
  '.well-known/webfinger',
  async (req, res, next) => {
    try {
      const resource = req.query.resource
      if (!resource) {
        next(err(400))
      } else if (typeof resource !== 'string') {
        next(err(400))
      } else if (!resource.startsWith('acct:')) {
        next(err(400))
      } else {
        const [username, domain] = resource.substr(5).split('@')
        if (!domain || !username) {
          next(err(400))
          return
        }
        const user = await prisma.user.findUnique({ where: { username } })
        if (!user) {
          next(err(404))
          return
        }
        res.status(200).json({
          subject: resource,
          aliases: [
            // TODO: We should check to ensure that this is, in fact, our domain.
            new URL(`/users/${username}`, domain),
          ],
        })
      }
    } catch (e) {
      next(err(500, e))
    }
  }
)
