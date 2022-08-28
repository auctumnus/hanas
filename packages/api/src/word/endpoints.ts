import { prisma } from '../db'
import { Request, Router } from 'express'
import { err, handleCreateErr } from '../error'
import { getPaginationVars, paginate } from '../pagination'
import { serialize } from './serialize'
import { authenticated, getUser } from '../auth'
import { CreateWordDto } from './dto'
import { options } from '../options'

const filterableFields = [
  'word',
  'ipa',
  'notes',
  'word-class',
  'creator',
  'updater',
  'created',
  'updated',
] as const

const operators = ['>=', '<=', '>', '<', '~', '='] as const

type Flatten<Type> = Type extends Readonly<Array<infer Item>> ? Item : Type

interface Filter {
  field: Flatten<typeof filterableFields>
  operator: Flatten<typeof operators>
  content: string
}

const isKeyOfObject = <T>(
  key: string | number | symbol,
  obj: T
): key is keyof T => key in obj
/*
const isFilter = (o: unknown): o is Filter => {
  if (typeof o !== 'object' || !o) return false
  if (!('field' in o && 'operator' in o && 'content' in o)) return false
}
*/
const getWordFilter = (req: Request) => {}

export const wordsRouter = Router()
  .options('/:code/word/', options('OPTIONS, GET, POST'))

  .get('/:code/word/', async (req, res, next) => {
    const { code } = req.params

    try {
      const lang = prisma.lang.findUnique({ where: { code } })
      if (!lang) {
        next(err(404, 'No language was found by that code.'))
        return
      }

      const result = (
        await prisma.word.findMany({
          ...getPaginationVars(req),
          where: {
            lang: {
              code,
            },
          },
          include: {
            wordClasses: true,
          },
        })
      ).map((word) => {
        return {
          ...word,
          wordClasses: word.wordClasses.map(({ abbreviation, name }) => ({
            abbreviation,
            name,
          })),
        }
      })

      res.status(200).json(serialize(paginate(req, result)))
    } catch (e) {
      next(err(500, e))
    }
  })

  .post('/:code/word/', authenticated, async (req, res, next) => {
    const { username } = getUser(req)
    const code = req.params.code
    try {
      const data = CreateWordDto.parse(req.body)

      const lang = await prisma.lang.findUnique({ where: { code } })

      if (!lang) {
        next(err(404, 'No language exists by that code.'))
      }

      getWordFilter(req)

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

      console.log(perms)

      if (!perms || !(perms.changeWords || perms.owner)) {
        next(
          err(403, 'You do not have permission to add words to this language.')
        )
        return
      }

      const wordClasses = await Promise.all(
        data.wordClasses?.map(async (abbreviation) => ({
          abbreviation,
          wordClass: await prisma.wordClass.findFirst({
            where: { lang: { code }, abbreviation },
          }),
        })) || []
      )

      const missingWordClasses = wordClasses.filter(
        ({ wordClass }) => !wordClass
      )

      if (missingWordClasses.length) {
        const stringified = missingWordClasses
          .map(({ abbreviation }) => `"${abbreviation}"`)
          .join(', ')
        next(
          err(400, `The following word classes are undefined: [${stringified}]`)
        )
        return
      }

      const connectWordClasses = wordClasses.map(({ wordClass }) => ({
        id: wordClass!.id,
      }))

      const result = await prisma.word.create({
        data: {
          ...data,
          lang: {
            connect: {
              code,
            },
          },
          createdBy: {
            connect: {
              username,
            },
          },
          wordClasses: {
            connect: connectWordClasses,
          },
        },
      })

      res.status(201).json(serialize(result))
    } catch (e) {
      handleCreateErr('word', e, next)
    }
  })

  .get('/:code/word/:word', async (req, res, next) => {
    const code = req.params.code
    const word = req.params.word
    try {
      const lang = prisma.lang.findUnique({ where: { code } })
      if (!lang) {
        next(err(404, 'No language was found by that code.'))
        return
      }

      const result = await prisma.word.findMany({
        ...getPaginationVars(req),
        where: {
          word,
          lang: {
            code,
          },
        },
        include: {
          wordClasses: true,
        },
      })

      res.status(200).json(serialize(paginate(req, result)))
    } catch (e) {
      next(err(500, e))
    }
  })

  .get('/:code/word/:word/:entry', async (req, res, next) => {
    const code = req.params.code
    const word = req.params.word
    const entry = Number(req.params.entry)

    if (Number.isNaN(entry)) {
      next(err(400, 'Entry must be a number.'))
    }
    try {
      const lang = prisma.lang.findUnique({ where: { code } })
      if (!lang) {
        next(err(404, 'No language was found by that code.'))
        return
      }

      const result = await prisma.word.findMany({
        where: {
          word,
          lang: {
            code,
          },
        },
        skip: entry,
        take: 1,
      })

      if (!result.length) {
        next(err(404, 'No entry was found by that word and number.'))
        return
      }

      console.log(result)

      res.status(200).json(serialize(result[0]))
    } catch (e) {
      next(err(500, e))
    }
  })
