import { readFile } from 'fs/promises'
import { err } from './log'
import { parse } from './parse'
import { parse as parseKDL } from 'kdljs'
import { writeFile } from 'fs/promises'
import { toHTML } from './html'
import kleur from 'kleur'

export const generate = (inputFile: string, output: string) =>
  readFile(inputFile)
    .catch((e) => {
      err("Couldn't read input file!")
      err(e)
      process.exit(1)
    })
    .then((input) => input.toString())
    .then((input) => {
      if (inputFile.endsWith('.kdl')) {
        const parsed = parseKDL(input)
        if (parsed.errors.length) {
          err("Couldn't parse input to KDL!")
          parsed.errors.forEach(err)
          throw new Error("Couldn't parse input to KDL!")
        }
        return parse(parsed.output!)
      } else if (inputFile.endsWith('.json')) {
        return JSON.parse(input) as ReturnType<typeof parse>
      } else {
        throw new Error("I don't recognize the input filetype!")
      }
    })
    .then(async ({ models, routes, meta }) => {
      if (output.endsWith('json')) {
        await writeFile(output, JSON.stringify({ models, routes, meta }))
      } else if (output.endsWith('html')) {
        await writeFile(output, toHTML(routes, models, meta))
      }
      return { models, routes, meta }
    })
