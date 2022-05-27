import { Router } from 'express'
import { prisma } from '../db'
import { serialize } from './serialize'
import { paginate, getPaginationVars } from '../pagination'
import { err, handleCreateErr } from '../error'
import { authenticated, getUser } from '../auth'
import { options } from '../options'
import { UpdateLangPermissionDto } from './dto'
import { LangPermission } from '@prisma/client'
import { checkCanAssign, checkPerms } from '.'
import { EMPTY_PERMS } from '../invite/endpoints'

export const permissionsRouter = Router()
  .options('/:code/perms', options('OPTIONS, GET'))

  .get('/:code/perms', authenticated, async (req, res, next) => {
    const code = req.params.code
    const { username } = getUser(req)

    try {
      if (!(await checkPerms(code, username!))) {
        next(
          err(
            403,
            'You do not have permission to see the permissions of this language.'
          )
        )
        return undefined
      }

      const result = await prisma.langPermission.findMany({
        ...getPaginationVars(req),
        where: { lang: { code } },
      })
      res.status(200).json(serialize(paginate(req, result)))
    } catch (e) {
      next(err(500, e))
    }
  })

  .options('/:code/perms/:theirUsername', options('OPTIONS, PATCH, DELETE'))

  // TODO: test
  .delete(
    '/:code/perms/:theirUsername',
    authenticated,
    async (req, res, next) => {
      const { code, theirUsername } = req.params
      const ourUsername = getUser(req).username!

      try {
        const ourPerms = await prisma.langPermission.findFirst({
          where: {
            user: {
              username: ourUsername,
            },
            lang: { code },
          },
        })
        if (!ourPerms) {
          next(
            err(
              403,
              'You do not have permission to edit the permissions of this language.'
            )
          )
          return
        }
        if (ourPerms && theirUsername === ourUsername) {
          await prisma.langPermission.delete({ where: { id: ourPerms.id } })
          res.status(200).send()
          return
        }

        const theirPerms = await prisma.langPermission.findFirst({
          where: {
            user: {
              username: theirUsername,
            },
            lang: { code },
          },
        })
        if (!theirPerms) {
          next(
            err(403, 'This user does not have permissions to this language.')
          )
          return
        }

        if (checkCanAssign(ourPerms, theirPerms, EMPTY_PERMS, next)) {
          await prisma.langPermission.delete({ where: { id: theirPerms.id } })
        }
      } catch (e) {
        next(err(500, e))
      }
    }
  )

  .patch(
    '/:code/perms/:theirUsername',
    authenticated,
    async (req, res, next) => {
      const code = req.params.code
      const theirUsername = req.params.theirUsername
      const ourUsername = getUser(req).username!

      try {
        // This could technically be part of the permissions check later but
        // honestly it's just more readable lke this.
        if (!(await checkPerms(code, ourUsername))) {
          next(
            err(
              403,
              'You do not have permission to edit the permissions of this language.'
            )
          )
          return undefined
        }

        const newPerms = UpdateLangPermissionDto.parse(req.body)

        const [ourPerms, theirPerms] = (await Promise.all(
          [ourUsername, theirUsername].map((username) =>
            prisma.langPermission.findFirst({
              where: {
                user: { username },
                lang: { code },
              },
              include: {
                user: true,
                lang: true,
              },
            })
          )
        )) as LangPermission[]

        if (!theirPerms) {
          next(
            err(
              404,
              'No user with permissions for this language was found by that username.'
            )
          )
        } else if (checkCanAssign(ourPerms, theirPerms, newPerms, next)) {
          if (newPerms.owner) {
            // Only the owner can make someone else owner, so we can just assume our perms are
            // the owner perms.
            // We also give the owner all permissions afterward. If the new owner doesn't like this,
            // they can just remove the old owner.
            // TODO: This should probably be documented.
            // Actually, is it even a good idea? Ask around.
            await prisma.langPermission.update({
              data: {
                changePermissions: true,
                changeWords: true,
                changeInfo: true,
                changeId: true,
              },
              where: {
                id: ourPerms.id,
              },
            })
          }

          const result = await prisma.langPermission.update({
            data: newPerms,
            where: {
              id: theirPerms.id,
            },
          })

          res.status(200).json(serialize(result))
        }
      } catch (e) {
        handleCreateErr('permission', e, next)
      }
    }
  )
