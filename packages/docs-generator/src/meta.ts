import { kdljs } from 'kdljs'

const find = (document: kdljs.Node[]) => (nodeName: string) => {
  const node = document.find(({ name }) => name === nodeName)

  if (!node) return undefined

  if (!node.values.length) return undefined

  if (typeof node.values[0] !== 'string') return undefined

  return node.values[0]
}

const defaultMeta = {
  name: 'API description',
  summary: '',
  description: '',
}

export const extractMeta = (document: kdljs.Document) => {
  const meta = document.find(({ name }) => name === 'meta')
  if (!meta) return defaultMeta

  const inMeta = find(meta.children)

  return Object.assign(defaultMeta, {
    name: inMeta('name'),
    summary: inMeta('summary'),
    description: inMeta('description'),
  })
}

export type Meta = typeof defaultMeta
