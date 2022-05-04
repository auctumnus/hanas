import sade from 'sade'
import chokidar from 'chokidar'
import kleur from 'kleur'
import { err } from './log'
import { version } from '../package.json'
import { generate } from './gen'
import { hrtime } from 'process'
import { Route } from './route'

const num = (o: Record<any, any>) => Object.entries(o).length

const pretty = (ns: bigint) => {
  const ms = ns / 10000000n
  const s = ms / 1000n
  const min = s / 60n

  let str = ''

  if (ms < 1) {
    return kleur.cyan(`${ns / 1000n}µs (woah!)`)
  } else {
    str = kleur.blue(`${ms}ms`)
  }
  if (s > 1) {
    str = kleur.green(`${s}s`) + str
  }
  if (min > 1) {
    str = kleur.yellow(`${min}min`) + str
  }
  return str
}

const countRoutes = (r: Record<string, Route> | Route[]): number =>
  Array.isArray(r)
    ? r.length + r.reduce((a, v) => a + countRoutes(v.subroutes), 0)
    : countRoutes(Object.values(r))

const countOperations = (r: Record<string, Route> | Route[]): number =>
  Array.isArray(r)
    ? r.map((r) => Object.values(r.operations)).flat().length +
      r.reduce((a, v) => a + countOperations(v.subroutes), 0)
    : countOperations(Object.values(r))

const gen = async (input: string, output: string) => {
  const startTime = hrtime.bigint()
  const info = await generate(input, output)
  const endTime = hrtime.bigint()
  const duration = endTime - startTime
  console.log(
    kleur.gray(
      `Done! (took ${pretty(duration)}, ` +
        `wrote ${kleur.blue(num(info.models))} models, ` +
        `${kleur.blue(countRoutes(info.routes))} routes, ` +
        `${kleur.blue(countOperations(info.routes))} operations)`
    )
  )
}

sade('hanas-docs-gen <input> <output>', true)
  .version(version)
  .option('-w, --watch', 'Watch KDL file for changes and output on changes')
  .option('-d, --debug', 'Emit debug logging')
  .action(async (input, output, opts) => {
    let error = false
    if (!input || typeof input !== 'string') {
      err('No input specified!')
      error = true
    } else if (!input.endsWith('.kdl') && !input.endsWith('.json')) {
      err(`"${input}" doesn't look like a KDL or JSON file!`)
      error = true
    }
    if (!output || typeof output !== 'string') {
      err('No output specified!')
      error = true
    }
    if (error) {
      process.exit(1)
    }

    if (opts.watch) {
      console.log(kleur.gray('Started watch! Generating for the first time...'))
      try {
        await gen(input, output)
        chokidar.watch(input).on('change', async () => {
          console.log(kleur.gray('Input file changed, generating...'))
          try {
            await gen(input, output)
          } catch (e) {
            err(e)
          }
        })
      } catch (e) {
        err(e)
      }
    } else {
      console.log(kleur.gray('Generating...'))
      try {
        await gen(input, output)
        console.log(kleur.gray('Done!'))
      } catch (e) {
        err(e)
      }
    }
  })
  .parse(process.argv)
