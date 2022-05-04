import { parse as parseKDL } from 'kdljs'
import { parseModelsFromDocument } from './model'
import { err } from './log'
import { inspect } from 'util'
import { parseRoutesFromDocument, Route } from './route'
import { linkIncludes } from './link'
import { Model } from './types'
import { kdljs } from 'kdljs'
import { extractMeta } from './meta'

export const parse = (document: kdljs.Document) => {
  const { models, errors: modelErrors } = parseModelsFromDocument(document)

  if (modelErrors.length) {
    err('Error(s) parsing models:')
    modelErrors.forEach((error) => {
      err(`  In model "${error.name}": `)
      if (error.inProperty) {
        err(`    In property "${error.inProperty}": `)
        err(`      ${error.details}`)
      } else {
        err(`    ${error.details}`)
      }
    })
    console.log('')
  }

  const { routes, errors: routeErrors } = parseRoutesFromDocument(document)

  if (routeErrors.length) {
    err('Error(s) parsing routes:')
    routeErrors.forEach((error) => {
      err(` In route with path "${error.path}":`)
      if (typeof error.details === 'string') {
        err(`    ${error.details}`)
      } else {
        err(`    In ${error.details.name}:`)
        if (error.details.inProperty) {
          err(`      In ${error.details.inProperty}`)
          err(`        ${error.details.details}`)
        } else {
          err(`      ${error.details.details}`)
        }
      }
    })
    console.log('')
  }

  const getBodies = (route: Route): [string, Model][] => {
    const bodies: [string, Model][] = []
    Object.entries(route.operations).forEach(([verb, operation]) => {
      if (operation.request) {
        bodies.push([
          `${verb} ${route.path} request body`,
          operation.request.content,
        ])
      }
      operation.responses.forEach((response, i) =>
        'content' in response && response.content
          ? bodies.push([
              `${verb} ${route.path} response body ${i}`,
              response.content,
            ])
          : undefined
      )
    }),
      route.subroutes.map(getBodies).forEach((b) => bodies.push(...b))
    return bodies
  }

  const bodies = Object.values(routes).map(getBodies).flat()

  linkIncludes({
    ...models,
    ...Object.fromEntries(bodies),
  })

  const meta = extractMeta(document)

  return { models, routes, meta }
}
