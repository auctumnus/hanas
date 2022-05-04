import { LangPermission } from '@prisma/client'
import { NextFunction, Router, Request, Response } from 'express'
import { authenticated, getUser } from '../auth'
import { prisma } from '../db'
import { err, handleCreateErr } from '../error'
import { options } from '../options'
import { CreateInviteDto } from './dto'
import { checkCanAssign, checkPerms } from '../lang-permissions'
import { serialize } from './serialize'
import { exclude } from '../exclude'
import { z } from 'zod'
import { serialize as serializePermissions } from '../lang-permissions/serialize'
import { getPaginationVars, paginate } from '../pagination'
import { serialize as serializeUser } from '../user/serialize'

export const EMPTY_PERMS = {
  id: '',
  userID: '',
  langID: '',

  owner: false,
  changeId: false,
  changeInfo: false,
  changePermissions: false,
  changeWords: false,
} as LangPermission

type InviteDto = z.infer<typeof CreateInviteDto>

type ci = Omit<Extract<InviteDto, { username: string }>, 'username'>

const extractPerms = (data: ci & { username?: string }) =>
  exclude('username')(data) as ci

const getInviteByUsername = async (
  username: string,
  code: string,
  authUser: string
) => {
  // get invite by user
  try {
    const lang = await prisma.lang.findFirst({ where: { code } })

    if (!lang) {
      return err(404, 'No language was found by this code.')
    }

    const authUserPerms = await prisma.langPermission.findFirst({
      where: {
        user: { username: authUser },
        lang: { code },
      },
    })

    if (
      authUserPerms?.owner ||
      authUserPerms?.changePermissions ||
      authUser === username
    ) {
      const invite = await prisma.langInvite.findFirst({
        where: {
          receiver: { username },
          lang: { code },
        },
      })
      if (!invite) {
        return err(
          404,
          'No invite has been sent to this user for this language.'
        )
      } else {
        return invite
      }
    } else {
      return err(
        403,
        'You do not have permission to see an invite for this user for this language.'
      )
    }
  } catch (e) {
    return err(500, e)
  }
}

// TODO: Should invites expire?
// If so: How long do they last? How/when do we clear out old ones from the DB?
export const inviteRouter = Router()
  .options('/', options('OPTIONS, GET'))

  .options('/:code', options('OPTIONS, POST, GET, DELETE'))

  .get('/', authenticated, async (req, res, next) => {
    const { username } = getUser(req)

    // If the user specifies `?sent=1` or any other truthy value, then this
    // endpoint will list invites that the user has sent, rather than
    // ones the user has received.
    const side = req.query.sent ? 'sender' : 'receiver'

    try {
      // This is kinda confusing, but what it's doing is making a paginated
      // version of the the results for the right "side" of the invite.
      const result = await prisma.langInvite.findMany({
        ...getPaginationVars(req),
        include: {
          [side]: true,
          lang: {
            select: {
              code: true,
            },
          },
        },
        where: {
          [side]: {
            username,
          },
        },
      })
      res.status(200).json(
        serialize(
          paginate(
            req,
            // This is being added to the LangInvite so that you can see
            // which language this invite is for.
            // @ts-ignore
            result.map((i) => ({ ...i, code: i.lang.code }))
          )
        )
      )
    } catch (e) {
      next(err(500, e))
    }
  })

  .get('/:code', authenticated, async (req, res, next) => {
    const code = req.params.code
    const { username } = getUser(req)

    try {
      const lang = await prisma.lang.findUnique({ where: { code } })
      if (!lang) {
        next(err(404, 'No language was found by this code.'))
        return undefined
      }
      const perms = await prisma.langPermission.findFirst({
        where: {
          user: { username },
        },
      })
      if (perms && (perms.changePermissions || perms.owner)) {
        const invites = await prisma.langPermission.findMany({
          ...getPaginationVars(req),
          where: {
            lang: { code },
          },
        })
        res.status(200).json(serialize(paginate(req, invites)))
      } else {
        next(
          err(
            403,
            'You do not have permission to see the permissions of this language.'
          )
        )
      }
    } catch (e) {
      next(err(500, e))
    }
  })

  .get('/:code/:username', authenticated, async (req, res, next) => {
    const { username, code } = req.params
    const { username: authUser } = getUser(req)
    const result = await getInviteByUsername(username, code, authUser!)
    if (result instanceof Error) {
      next(result)
    } else {
      res.status(200).json(serialize(result))
    }
  })

  .get('/:code/:username/sender', authenticated, async (req, res, next) => {
    const { username, code } = req.params
    const { username: authUser } = getUser(req)
    const result = await getInviteByUsername(username, code, authUser!)
    if (result instanceof Error) {
      next(result)
    } else {
      const user = await prisma.user.findUnique({
        where: { id: result.senderID },
      })
      if (!user) {
        next(
          err(
            404,
            'The sender was not found for this invite. (Maybe their account was deleted?)'
          )
        )
      } else {
        res.status(200).json(serializeUser(user))
      }
    }
  })

  .get('/:code/:username/receiver', authenticated, async (req, res, next) => {
    const { username, code } = req.params
    const { username: authUser } = getUser(req)
    const result = await getInviteByUsername(username, code, authUser!)
    if (result instanceof Error) {
      next(result)
    } else {
      const user = await prisma.user.findUnique({
        where: { id: result.receiverID },
      })
      if (!user) {
        next(
          err(
            404,
            'The receiver was not found for this invite. (Maybe their account was deleted?)'
          )
        )
      } else {
        res.status(200).json(serializeUser(user))
      }
    }
  })

  .delete('/:code', authenticated, async (req, res, next) => {
    const { code } = req.params
    const { username } = getUser(req)
    try {
      const invite = await prisma.langInvite.findFirst({
        where: {
          receiver: { username },
          lang: { code },
        },
      })
      if (!invite) {
      }
    } catch (e) {
      next(err(500, e))
    }
  })

  // TODO: All of this needs testing.
  // This one is really long and annoying to read. It should probably
  // get refactored somehow, but refactoring it seems like it'd make a lot of
  // one-use functions.
  .post('/:code', authenticated, async (req, res, next) => {
    const code = req.params.code
    const { username } = getUser(req)

    try {
      const data = CreateInviteDto.parse(req.body)

      // We essentially have three separate paths for this; it somewhat breaks
      // RESTful practices, but any other API really wouldn't be as nice
      // semantically.
      // One path is for accepting an invite,
      // another for denying one,
      // and one for sending an invite.
      if ('accept' in data && data.accept) {
        // This is the user attempting to accept (or deny) an invite.
        const invite = await prisma.langInvite.findFirst({
          where: {
            lang: { code },
            receiver: { username },
            active: true,
          },
          include: {
            receiver: true,
          },
        })

        if (!invite) {
          next(err(404, 'No invite for this language has been sent to you.'))
          return undefined
        }

        const senderUsername = invite.receiver.username
        const receiverUsername = username

        const permissions = await prisma.langPermission.create({
          data: {
            ...extractPerms(invite),
            user: {
              connect: {
                username: receiverUsername,
              },
            },
            lang: {
              connect: {
                code,
              },
            },
            createdBy: {
              connect: {
                username: senderUsername,
              },
            },
            lastUpdatedBy: {
              connect: {
                username: senderUsername,
              },
            },
          },
        })

        await prisma.langInvite.update({
          where: { id: invite.id },
          data: {
            active: false,
            accepted: new Date(),
          },
        })

        res.status(201).send(serializePermissions(permissions))
      } else if ('accept' in data) {
        // This is the user attempting to deny an invite.
        const invite = await prisma.langInvite.findFirst({
          where: {
            lang: { code },
            receiver: { username },
            active: true,
          },
        })

        if (!invite) {
          next(err(404, 'No invite for this language has been sent to you.'))
          return undefined
        }

        await prisma.langInvite.update({
          where: { id: invite.id },
          data: { active: false },
        })

        res.status(200).send()
      } else {
        // This is the user attempting to create an invite.
        const senderUsername = username
        const receiverUsername = data.username

        if (!(await checkPerms(code, senderUsername!))) {
          next(
            err(
              403,
              'You do not have permission to invite users to this language.'
            )
          )
          return undefined
        }

        // We can't invite users that already have permissions to the language.
        const [senderPerms, receiverPerms] = (await Promise.all(
          [senderUsername, receiverUsername].map((username) =>
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

        if (receiverPerms) {
          next(err(400, 'This user already has permissions to this language.'))
          return undefined
        }

        // We can't invite users that have already been invited.
        const receiverInvite = await prisma.langInvite.findFirst({
          where: {
            lang: { code },
            receiver: { username: receiverUsername },
          },
        })

        if (receiverInvite) {
          next(err(400, 'This user already has an invite to this language.'))
          return undefined
        }

        // We give the `checkCanAssign` function an empty perms object for the
        // theirPerms argument since this person currently has no permissions.
        if (checkCanAssign(senderPerms, EMPTY_PERMS, data, next)) {
          const result = await prisma.langInvite.create({
            data: {
              ...extractPerms(data),
              lang: { connect: { code } },
              sender: { connect: { username: senderUsername } },
              receiver: { connect: { username: receiverUsername } },
              active: true,
            },
          })
          res.status(201).json(serialize(result))
        } else {
          next(err(403, 'You are not allowed to assign these permissions.'))
        }
      }
    } catch (e) {
      handleCreateErr('invite', e, next)
    }
  })
