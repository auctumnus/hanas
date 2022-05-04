import { parse, Model } from 'docs-generator'
import { Property, StringProperty } from 'docs-generator/src/types'
import { readFileSync } from 'fs'
import { writeFile } from 'fs/promises'

const content = readFileSync('../api/endpoints.kdl').toString()

const { models } = parse(content)

const autoGeneratedWarning = `// This file is automatically generated. Do not manually edit it.\n`

const isDate = (p: Property) =>
  p.type === 'string' && (p as StringProperty).format === 'datetime'

const týpe = (p: Property) => (isDate(p) ? 'Date' : p.type)

const length = (p: Property) => {
  const s = p as StringProperty
  if (s.maxLength && s.minLength) {
    return `\n     *\n     * min length ${s.maxLength}, max length ${s.minLength}`
  } else if (s.minLength) {
    return `\n     *\n     * min length ${s.minLength}`
  } else if (s.maxLength) {
    return `\n     *\n     * max length ${s.maxLength}`
  } else {
    return ''
  }
}

const makeProperty = (p: Property) =>
  '/**\n' +
  p.description
    .split('\n')
    .map((line) => `     * ${line}`)
    .join('\n') +
  (p.type === 'string' &&
  p.hasOwnProperty('regex') &&
  (p as StringProperty).regex
    ? `\n     *\n     * Follows the regex /${(p as StringProperty).regex}/`
    : '') +
  length(p) +
  '\n     */\n' +
  `    ${p.name}${p.optional ? '?' : ''}: ${týpe(p)}\n    `

const makeInterface = (model: Model) =>
  `export interface ${model.name} {
    ${Object.values(model.properties).map(makeProperty).join('')}
}`

const index =
  autoGeneratedWarning +
  Object.values(models)
    .map(({ name }) => `export * from './${name}'`)
    .join('\n')

const generateModels = async () =>
  Promise.all([
    ...Object.values(models)
      .map((model) => ({ name: model.name, content: makeInterface(model) }))
      .map(({ name, content }) =>
        writeFile(`./src/models/${name}.ts`, content)
      ),
    writeFile('./src/models/index.ts', index),
  ])

;(async () => await generateModels())()
