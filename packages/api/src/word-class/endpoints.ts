import { Router } from 'express'
import { authenticated, getUser } from '../auth'
import { prisma } from '../db'
import { err, handleCreateErr } from '../error'
import { getPaginationVars, paginate } from '../pagination'
import { CreateWordClassDto, UpdateWordClassDto } from './dto'
import { serialize } from './serialize'

export const wordClassRouter = Router()
  .get('/:code/word-class', authenticated, async (req, res, next) => {
    const { username } = getUser(req)
    const { code } = req.params
    try {
      const lang = prisma.lang.findUnique({ where: { code } })
      if (!lang) {
        next(err(404, 'No language was found by that code.'))
        return
      }

      const perms = await prisma.langPermission.findFirst({
        where: {
          lang: {
            code,
          },
          user: {
            username,
          },
        },
      })

      if (!perms || !(perms.changeWords || perms.owner)) {
        next(
          err(
            403,
            'You do not have permission to view word classes for this language.'
          )
        )
        return
      }

      const result = await prisma.wordClass.findMany({
        ...getPaginationVars(req),
        where: {
          lang: {
            code,
          },
        },
      })

      res.status(200).json(serialize(paginate(req, result)))
    } catch (e) {
      handleCreateErr('word class', e, next)
    }
  })
  .post('/:code/word-class', authenticated, async (req, res, next) => {
    const { username } = getUser(req)
    const { code } = req.params
    try {
      const data = CreateWordClassDto.parse(req.body)
      const lang = prisma.lang.findUnique({ where: { code } })
      if (!lang) {
        next(err(404, 'No language was found by that code.'))
        return
      }
      const perms = await prisma.langPermission.findFirst({
        where: {
          lang: {
            code,
          },
          user: {
            username,
          },
        },
      })

      if (!perms || !(perms.changeWords || perms.owner)) {
        next(
          err(
            403,
            'You do not have permission to add word classes to this language.'
          )
        )
        return
      }

      const wordClassAlreadyExists = await prisma.wordClass.findFirst({
        where: {
          OR: [
            {
              abbreviation: data.abbreviation,
            },
            {
              name: data.name,
            },
          ],
          lang: {
            code,
          },
        },
      })

      if (wordClassAlreadyExists) {
        const isAbbreviationSame =
          wordClassAlreadyExists.abbreviation === data.abbreviation
        const isNameSame = wordClassAlreadyExists.name === data.name
        const areBothSame = isAbbreviationSame && isNameSame
        next(
          err(
            400,
            'This word class has the same ' +
              (areBothSame
                ? 'name and abbreviation'
                : isAbbreviationSame
                ? 'abbreviation'
                : isNameSame
                ? 'name'
                : '(nothing?? report this)') +
              ' as another existing word class (abbreviation ' +
              wordClassAlreadyExists.abbreviation +
              ').'
          )
        )
        return
      }

      const result = await prisma.wordClass.create({
        data: {
          name: data.name,
          abbreviation: data.abbreviation,
          createdBy: {
            connect: {
              username,
            },
          },
          lang: {
            connect: {
              code,
            },
          },
        },
      })

      res.status(201).json(serialize(result))
    } catch (e) {
      handleCreateErr('word class', e, next)
    }
  })
  .get(
    '/:code/word-class/:abbreviation',
    authenticated,
    async (req, res, next) => {
      const { username } = getUser(req)
      const { code, abbreviation } = req.params
      try {
        const lang = prisma.lang.findUnique({ where: { code } })
        if (!lang) {
          next(err(404, 'No language was found by that code.'))
          return
        }

        const perms = await prisma.langPermission.findFirst({
          where: {
            lang: {
              code,
            },
            user: {
              username,
            },
          },
        })

        if (!perms || !(perms.changeWords || perms.owner)) {
          next(
            err(
              403,
              'You do not have permission to view word classes for this language.'
            )
          )
          return
        }

        const result = await prisma.wordClass.findFirst({
          where: {
            abbreviation,
            lang: {
              code,
            },
          },
        })

        if (!result) {
          next(
            err(
              404,
              'No word class was found by that language and abbreviation.'
            )
          )
          return
        }

        res.status(200).json(serialize(result))
      } catch (e) {
        next(err(500, e))
      }
    }
  )
  .patch(
    '/:code/word-class/:abbreviation',
    authenticated,
    async (req, res, next) => {
      const { username } = getUser(req)
      const { code, abbreviation } = req.params
      try {
        const data = UpdateWordClassDto.parse(req.body)
        const lang = prisma.lang.findUnique({ where: { code } })
        if (!lang) {
          next(err(404, 'No language was found by that code.'))
          return
        }

        const perms = await prisma.langPermission.findFirst({
          where: {
            lang: {
              code,
            },
            user: {
              username,
            },
          },
        })

        if (!perms || !(perms.changeWords || perms.owner)) {
          next(
            err(
              403,
              'You do not have permission to view word classes for this language.'
            )
          )
          return
        }

        const thisWordClass = await prisma.wordClass.findFirst({
          where: {
            abbreviation,
            lang: {
              code,
            },
          },
        })

        if (!thisWordClass) {
          next(
            err(
              404,
              'No word class was found by that language and abbreviation.'
            )
          )
          return
        }

        const wordClassAlreadyExists = await prisma.wordClass.findFirst({
          where: {
            NOT: {
              id: thisWordClass.id,
            },
            OR: [
              {
                abbreviation: data.abbreviation,
              },
              {
                name: data.name,
              },
            ],
            lang: {
              code,
            },
          },
        })

        if (wordClassAlreadyExists) {
          const isAbbreviationSame =
            wordClassAlreadyExists.abbreviation === data.abbreviation
          const isNameSame = wordClassAlreadyExists.name === data.name
          const areBothSame = isAbbreviationSame && isNameSame
          next(
            err(
              400,
              'This word class has the same ' +
                (areBothSame
                  ? 'name and abbreviation'
                  : isAbbreviationSame
                  ? 'abbreviation'
                  : isNameSame
                  ? 'name'
                  : '(nothing?? report this)') +
                ' as another existing word class (abbreviation ' +
                wordClassAlreadyExists.abbreviation +
                ').'
            )
          )
          return
        }

        const result = await prisma.wordClass.update({
          where: {
            id: thisWordClass.id,
          },
          data,
        })

        res.status(200).json(serialize(result))
      } catch (e) {
        next(err(500, e))
      }
    }
  )
