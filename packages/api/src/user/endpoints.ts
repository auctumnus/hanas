import { Router } from 'express'
import { UpdateUserDto } from './dto'
import { prisma } from '../db'
import { err, handleCreateErr } from '../error'
import { getPaginationVars, paginate } from '../pagination'
import { getUser, updateUsername, deleteUser, authenticated } from '../auth'
import { serialize } from './serialize'
import { serialize as serializeLang } from '../lang/serialize'
import { options } from '../options'

export const userRouter = Router()
  .options('/', options('OPTIONS, GET'))

  // TODO: Normally I would be worried about a username enumeration attack, but
  // once the kratos hooks pr gets merged, we can remove the ability to log in
  // by username and only allow email/oidc.
  .get('/', async (req, res, next) => {
    try {
      const result = await prisma.user.findMany(getPaginationVars(req))
      res.status(200).json(serialize(paginate(req, result)))
    } catch (e) {
      next(err(500, e))
    }
  })

  .post('/', (_, __, next) =>
    next(err(405, 'Use the Kratos endpoints to register a user.'))
  )

  .options('/:username', options('OPTIONS, GET, PATCH, DELETE'))

  .get('/:username', async (req, res, next) => {
    try {
      const username = req.params.username
      const result = await prisma.user.findUnique({ where: { username } })

      if (result) {
        res.status(200).json(serialize(result))
      } else {
        next(err(404, 'No user was found with that username.'))
      }
    } catch (e) {
      next(err(500, e))
    }
  })

  .patch('/:username', authenticated, async (req, res, next) => {
    const { username, kratosID } = getUser(req)

    if (username !== req.params.username) {
      next(err(403, 'You do not have permission to edit another user.'))
      return undefined
    }
    try {
      const data = UpdateUserDto.parse(req.body)

      const result = await prisma.user.update({
        where: { username },
        data,
      })
      // If the user is changing their username, it needs to get changed on the
      // Kratos end.
      if (data.username) {
        await updateUsername(req, kratosID!, data.username)
      }

      res.status(200).json(serialize(result))
    } catch (e) {
      handleCreateErr('user', e, next)
    }
  })

  .delete('/:username', authenticated, async (req, res, next) => {
    const { username, kratosID } = getUser(req)

    if (username !== req.params.username) {
      next(err(403, 'You do not have permission to delete another user.'))
      return undefined
    }
    try {
      // This suffers from N+1 but deleting a user is likely an uncommon action
      // and N is probably small.
      await prisma.$transaction(
        (
          await prisma.langPermission.findMany({
            include: {
              user: true,
              lang: true,
            },
            where: {
              owner: true,
              user: {
                username,
              },
            },
          })
        ).map((ownership) =>
          prisma.lang.delete({
            where: {
              id: ownership.lang.id,
            },
          })
        )
      )
      await prisma.user.delete({ where: { username } })
      await deleteUser(kratosID!)
      res.status(204).send('')
    } catch (e) {
      next(err(500, e))
    }
  })

  .options('/:username/langs', options('OPTIONS, GET'))

  .get('/:username/collaborated-langs', async (req, res, next) => {
    const username = req.params.username

    try {
      const result = await prisma.langPermission.findMany({
        where: {
          user: { username },
        },
        include: {
          user: true,
          lang: true,
        },
        ...getPaginationVars(req),
      })

      if (result) {
        const { data, cursor } = paginate(req, result)

        res
          .status(200)
          .json({ cursor, data: data.map((p) => serializeLang(p.lang)) })
      } else {
        next(err(404, 'No languages were found by that username.'))
      }
    } catch (e) {
      next(err(500, e))
    }
  })

  .get('/:username/owned-langs', async (req, res, next) => {
    const username = req.params.username

    try {
      const result = await prisma.langPermission.findMany({
        where: {
          user: { username },
          owner: true,
        },
        include: {
          user: true,
          lang: true,
        },
        ...getPaginationVars(req),
      })

      if (result) {
        const { data, cursor } = paginate(req, result)

        res
          .status(200)
          .json({ cursor, data: data.map((p) => serializeLang(p.lang)) })
      } else {
        next(err(404, 'No languages were found by that username.'))
      }
    } catch (e) {
      next(err(500, e))
    }
  })
