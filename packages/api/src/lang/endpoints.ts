import { Router } from 'express'
import { prisma } from '../db'
import { paginate, getPaginationVars } from '../pagination'
import { err, handleCreateErr } from '../error'
import { serialize } from './serialize'
import { getUser, authenticated } from '../auth'
import { CreateLangDto, UpdateLangDto } from './dto'
import { options } from '../options'
import { z } from 'zod'
import { UpdateLangPermissionDto } from '../lang-permissions/dto'

type UpdateLangDtoType = z.infer<typeof UpdateLangDto>
type UpdateLangPermissionDtoType = z.infer<typeof UpdateLangPermissionDto>

const permMap: Record<
  keyof UpdateLangDtoType,
  keyof UpdateLangPermissionDtoType
> = {
  code: 'changeId',
  description: 'changeInfo',
  name: 'changeInfo',
}

const unique = <T>(arr: T[]) =>
  arr.reduce((a, v) => (a.includes(v) ? a : [...a, v]), [] as T[])

const getNeededPerms = (data: UpdateLangDtoType) =>
  unique(Object.keys(data).map((k) => permMap[k as keyof typeof permMap]))

const checkCanEdit = async (
  username: string,
  langCode: string,
  data: UpdateLangDtoType
) => {
  const neededPerms = getNeededPerms(data)
  const userPerms = await prisma.langPermission.findFirst({
    where: { user: { username }, lang: { code: langCode } },
  })
  if (!userPerms) {
    return false
  } else {
    return neededPerms.every((p) => userPerms[p])
  }
}

export const langRouter = Router()
  .options('/', options('OPTIONS, GET, POST'))

  .get('/', async (req, res, next) => {
    try {
      const result = await prisma.lang.findMany(getPaginationVars(req))
      res.status(200).json(serialize(paginate(req, result)))
    } catch (e) {
      next(err(500, e))
    }
  })

  .post('/', authenticated, async (req, res, next) => {
    const { username } = getUser(req)
    try {
      const data = CreateLangDto.parse(req.body)
      const user = {
        connect: {
          username,
        },
      }
      const result = await prisma.lang.create({
        data: {
          ...data,
          createdBy: user,
          lastUpdatedBy: user,
          langPermissions: {
            create: {
              owner: true,
              user,
            },
          },
        },
      })
      res.status(201).json(serialize(result))
    } catch (e) {
      handleCreateErr('lang', e, next)
    }
  })

  .get('/:code', async (req, res, next) => {
    try {
      const code = req.params.code
      const result = await prisma.lang.findUnique({ where: { code } })

      if (result) {
        res.status(200).json(serialize(result))
      } else {
        next(err(404, 'No language was found by that code.'))
      }
    } catch (e) {
      next(err(500, e))
    }
  })

  .patch('/:code', async (req, res, next) => {
    const { username } = getUser(req)
    const code = req.params.code
    try {
      const data = UpdateLangDto.parse(req.body)
      const lang = await prisma.lang.findUnique({ where: { code } })
      if (!lang) {
        next(err(404, 'No language was found by that code.'))
        return undefined
      }
      if (!checkCanEdit(username!, code, data)) {
        next(err(403, 'You do not have permission to make this edit.'))
        return undefined
      }

      const updated = await prisma.lang.update({
        where: { code },
        data: {
          ...data,
          lastUpdatedBy: {
            connect: {
              username,
            },
          },
        },
      })

      res.status(200).json(serialize(updated))
    } catch (e) {
      next(err(500, e))
    }
  })

  .delete('/:code', async (req, res, next) => {
    const { username } = getUser(req)
    const code = req.params.code
    try {
      const lang = await prisma.lang.findUnique({
        where: { code },
      })
      if (!lang) {
        next(err(404, 'No language was found by that code.'))
      }

      const perms = await prisma.langPermission.findFirst({
        where: { user: { username }, lang: { code } },
      })

      if (!perms.owner) {
        next(err(403, 'You must own the language to delete it.'))
      } else {
        prisma.lang.delete({ where: { code } })
        res.status(204).send('')
      }
    } catch (e) {
      next(err(500, e))
    }
  })
