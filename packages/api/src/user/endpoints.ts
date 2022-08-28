import { Router } from 'express'
import { UpdateUserDto } from './dto'
import { prisma } from '../db'
import { err, handleCreateErr } from '../error'
import { getPaginationVars, paginate } from '../pagination'
import { getUser, updateUsername, deleteUser, authenticated } from '../auth'
import { serialize } from './serialize'
import { serialize as serializeLang } from '../lang/serialize'
import { options } from '../options'
import fileUpload from 'express-fileupload'
import {
  getExtension,
  isSupportedImageType,
  removeFile,
  uploadFile,
} from '../storage'
import { STORAGE_PUBLIC_URL } from '../env'
import { nanoid } from 'nanoid'
import { emptySuccess } from '../emptySuccess'

const PROFILE_PICTURE_MAX_SIZE = 5242880

const getFilename = (u: URL) => {
  const parts = u.pathname.split('/')
  return parts[parts.length - 1]
}

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
      res.status(200).json(emptySuccess)
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
        select: {
          lang: true,
        },
        ...getPaginationVars(req),
      })

      res.status(200).json(
        serializeLang(
          paginate(
            req,
            result.map((r) => r.lang)
          )
        )
      )
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
        select: {
          lang: true,
        },
        ...getPaginationVars(req),
      })

      res.status(200).json(
        serializeLang(
          paginate(
            req,
            result.map((r) => r.lang)
          )
        )
      )
    } catch (e) {
      next(err(500, e))
    }
  })
  .get('/:username/profile-picture', async (req, res, next) => {
    try {
      const user = await prisma.user.findUnique({
        where: { username: req.params.username },
      })

      if (user) {
        if (user.profilePicture) {
          res.redirect(user.profilePicture)
        } else {
          // CHANGEME
          // TODO: this is VERY NOT SAFE
          res.redirect(
            `https://ui-avatars.com/api/?name=${
              user.displayName || user.username
            }`
          )
        }
      } else {
        next(err(404, 'No user was found by that username.'))
      }
    } catch (e) {
      next(err(500, e))
    }
  })

  .put(
    '/:username/profile-picture',
    authenticated,
    fileUpload({
      limits: { fileSize: 5 * 1024 * 1024 /* 5mb */ },
    }),
    async (req, res, next) => {
      const { username } = getUser(req)

      console.log(req.files)

      if (username !== req.params.username) {
        next(
          err(
            403,
            "You do not have permission to edit another user's profile picture."
          )
        )
        return undefined
      } else if (Array.isArray(req.files?.profilePicture)) {
        next(err(400, 'Only upload one file for this field.'))
        return undefined
      } else if (req.files?.profilePicture.truncated) {
        next(
          err(
            400,
            `File is above the limit of ${PROFILE_PICTURE_MAX_SIZE} bytes.`
          )
        )
        return undefined
      } else if (!req.files || !req.files.profilePicture) {
        next(err(400, 'Must upload an image to the `profilePicture` field.'))
        return undefined
      } else if (!isSupportedImageType(req.files.profilePicture.mimetype)) {
        next(err(400, 'Unsupported mimetype.'))
        return undefined
      }

      try {
        const user = await prisma.user.findUnique({ where: { username } })

        const file = req.files.profilePicture
        const md5prefix = file.md5.slice(0, 8)
        const fileName = `pfp-${username}-${md5prefix}.${getExtension(
          file.mimetype
        )}`
        const url = new URL(`hanas/${fileName}`, STORAGE_PUBLIC_URL) + ''

        await Promise.all([
          user!.profilePicture
            ? removeFile(getFilename(new URL(user!.profilePicture)))
            : undefined,
          uploadFile(fileName, file.data),
          prisma.user.update({
            where: { username },
            data: { profilePicture: url },
          }),
        ])

        res.status(201).json({ url })
      } catch (e) {
        next(err(500, e))
      }
    }
  )

  .delete(
    '/:username/profile-picture',
    authenticated,
    async (req, res, next) => {
      const { username } = getUser(req)
      if (username !== req.params.username) {
        next(
          err(
            403,
            "You do not have permission to edit another user's profile picture."
          )
        )
        return undefined
      }
      try {
        const user = await prisma.user.findUnique({ where: { username } })
        await Promise.all([
          user!.profilePicture
            ? removeFile(getFilename(new URL(user!.profilePicture)))
            : undefined,
          prisma.user.update({
            where: { username },
            data: { profilePicture: null },
          }),
        ])
        res.status(200).json(emptySuccess)
      } catch (e) {
        next(err(500, e))
      }
    }
  )

  .get('/:username/banner', async (req, res, next) => {
    try {
      const user = await prisma.user.findUnique({
        where: { username: req.params.username },
      })

      if (user) {
        if (user.banner) {
          res.redirect(user.banner)
        } else {
          next(err(404, 'No banner set for this user.'))
        }
      } else {
        next(err(404, 'No user was found by that username.'))
      }
    } catch (e) {
      next(err(500, e))
    }
  })

  .put(
    '/:username/banner',
    authenticated,
    fileUpload({
      limits: { fileSize: 5 * 1024 * 1024 /* 5mb */ },
    }),
    async (req, res, next) => {
      const { username } = getUser(req)

      console.log(req.files)

      if (username !== req.params.username) {
        next(
          err(403, "You do not have permission to edit another user's banner.")
        )
        return undefined
      } else if (Array.isArray(req.files?.banner)) {
        next(err(400, 'Only upload one file for this field.'))
        return undefined
      } else if (req.files?.banner.truncated) {
        next(
          err(
            400,
            `File is above the limit of ${PROFILE_PICTURE_MAX_SIZE} bytes.`
          )
        )
        return undefined
      } else if (!req.files || !req.files.banner) {
        next(err(400, 'Must upload an image to the `banner` field.'))
        return undefined
      } else if (!isSupportedImageType(req.files.banner.mimetype)) {
        next(err(400, 'Unsupported mimetype.'))
        return undefined
      }

      try {
        const user = await prisma.user.findUnique({ where: { username } })

        const file = req.files.banner
        const md5prefix = file.md5.slice(0, 8)
        const fileName = `banner-${username}-${md5prefix}.${getExtension(
          file.mimetype
        )}`
        const url = new URL(`hanas/${fileName}`, STORAGE_PUBLIC_URL) + ''

        await Promise.all([
          user!.banner
            ? removeFile(getFilename(new URL(user!.banner)))
            : undefined,
          uploadFile(fileName, file.data),
          prisma.user.update({
            where: { username },
            data: { banner: url },
          }),
        ])

        res.status(201).json({ url })
      } catch (e) {
        next(err(500, e))
      }
    }
  )

  .delete('/:username/banner', authenticated, async (req, res, next) => {
    const { username } = getUser(req)
    if (username !== req.params.username) {
      next(
        err(403, "You do not have permission to edit another user's banner.")
      )
      return undefined
    }
    try {
      const user = await prisma.user.findUnique({ where: { username } })
      await Promise.all([
        user!.banner
          ? removeFile(getFilename(new URL(user!.banner)))
          : undefined,
        prisma.user.update({
          where: { username },
          data: { banner: null },
        }),
      ])
      res.status(200).json(emptySuccess)
    } catch (e) {
      next(err(500, e))
    }
  })
