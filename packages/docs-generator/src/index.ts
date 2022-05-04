import { parse as parseAPI } from './parse'
import { parse as parseKDL } from 'kdljs'

export const parse = (content: string) => {
  const kdl = parseKDL(content)
  if (kdl.errors.length) {
    throw new Error('errors parsing KDL')
  } else {
    return parseAPI(kdl.output!)
  }
}

export { Model } from './types'
export { Route } from './route'
