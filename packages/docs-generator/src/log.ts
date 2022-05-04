import kleur from 'kleur'
import { inspect } from 'util'

const format = (prefix: string, ...args: any[]) => [
  prefix,
  ...args.map((v) =>
    typeof v === 'string' ? v : inspect(v, false, null, true)
  ),
]

export const warn = (...args: any[]) =>
  console.warn(...format(kleur.yellow().bold('[!]'), ...args))

export const err = (...args: any[]) =>
  console.error(...format(kleur.red().bold('[!]'), ...args))
