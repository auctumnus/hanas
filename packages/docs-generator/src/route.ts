import {
  BooleanProperty,
  Model,
  ModelParseError,
  NumericProperty,
  Property,
  StringProperty,
} from './types'
import { kdljs } from 'kdljs'
import { arrayToObj, parsePropertiesFromModel, parseProperty } from './model'
import { STATUS_CODES } from 'http'

export const HTTP_VERBS = [
  'GET',
  'POST',
  'PATCH',
  'DELETE',
  'PUT',
  'OPTIONS',
] as const

export type HTTPVerb = 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT' | 'OPTIONS'

export interface Request {
  content: Model
  queryParams: {
    name: string
    property: StringProperty | NumericProperty | BooleanProperty
  }[]
}

interface ErrorResponse {
  status: number
  err: string
}

interface SuccessResponse {
  status: number
  content?: Model
  paginated?: boolean
}

type Response = ErrorResponse | SuccessResponse

export interface Operation {
  description: string
  request?: Request
  responses: Response[]
  authenticated?: boolean
}

export interface Route {
  path: string
  operations: Partial<Record<HTTPVerb, Operation>>
  subroutes: Route[]
}

type RouteParseError = {
  path: string
  details: string | ModelParseError
}

type OperationParseError = string | ModelParseError

const parseRequest = (
  node: kdljs.Node,
  errors: OperationParseError[]
): Request | false => {
  const content = node.children.find(nameIs('content'))
  if (content) {
    const { properties, errors: modelParseErrors } = parsePropertiesFromModel(
      content,
      `request body`
    )
    if (modelParseErrors.length) {
      console.log(modelParseErrors)
      errors = [...errors, ...modelParseErrors]
      return false
    }

    const queryParams = node.children
      .filter(nameIs('query'))
      .map((q) => ({ name: q.values[0]! + '', property: parseProperty(q) }))
      .map(({ name, property }) => {
        if ('errors' in property) {
          errors = [...errors, ...property.errors]
        }
        return { name, property: { ...property, name } }
      })
      .filter(({ property }) => !('errors' in property))
      .map((v) => ({ name: v.name, property: v.property as Property }))
      .filter(
        ({ property }) =>
          property.type === 'string' ||
          property.type === 'number' ||
          property.type === 'boolean'
      )
      .map((v) => ({
        name: v.name,
        property: v.property as
          | StringProperty
          | NumericProperty
          | BooleanProperty,
      }))

    return {
      content: {
        name: 'request body',
        properties: arrayToObj(properties),
      },
      queryParams,
    }
  } else {
    errors.push('No content in request')
    return false
  }
}

const parseStatus = (value?: kdljs.Value) =>
  typeof value === 'number' ? value : 0

const nameIs = (name: string) => (o: { name: string }) => name === o.name

const parseResponse = (
  node: kdljs.Node,
  errors: OperationParseError[]
): false | Response => {
  const status = parseStatus(node.children.find(nameIs('status'))?.values[0])
  const content = node.children.find(nameIs('content'))
  const paginated = node.children.find(nameIs('paginated'))
  const err = node.children.find(nameIs('err'))
  let poisoned = false
  if (!status) {
    errors.push('Invalid status code for response')
    poisoned = true
  } else if (content && err) {
    errors.push('Cannot have both content and err')
    poisoned = true
  } else if (status < 400 && err) {
    errors.push('Cannot have ok status code and err')
    poisoned = true
  } else if (status >= 400 && content) {
    errors.push('Cannot have err status code and content')
    poisoned = true
  } else if (status !== 204 && !content && status < 400) {
    errors.push('Cannot have non-204 ok status code and no content')
    poisoned = true
  }

  let contentModel: Model
  let errMessage: string

  if (content) {
    const { properties, errors: modelParseErrors } = parsePropertiesFromModel(
      content,
      `response body ${status}`
    )
    if (modelParseErrors.length) {
      console.log(modelParseErrors)
      errors = [...errors, ...modelParseErrors]
      poisoned = true
    }
    contentModel = {
      name: 'request body',
      properties: arrayToObj(properties),
    }
  }
  if (err) {
    if (typeof err.values[0] !== 'string') {
      errMessage = STATUS_CODES[status] || 'Internal server error'
    } else {
      errMessage = err.values[0]
    }
  }

  if (poisoned) return false
  if (status < 400) {
    return {
      status,
      content: contentModel!,
      paginated: !!paginated,
    }
  } else {
    return {
      status,
      err: errMessage!,
    }
  }
}

const parseOperation = (node: kdljs.Node) =>
  node.children.reduce(
    (o, child) => {
      if (child.name === 'request') {
        if (o.operation.request) {
          o.errors.push('Request already defined')
        }
        const request = parseRequest(child, o.errors)
        if (request) {
          o.operation.request = request
        }
      } else if (child.name === 'response') {
        const response = parseResponse(child, o.errors)

        if (response) {
          o.operation.responses.push(response)
        }
      } else if (child.name === 'authenticated') {
        o.operation.authenticated = true
        o.operation.responses.push({
          status: 401,
          err: 'You must be authenticated to access this endpoint.',
        })
      } else if (child.name === 'description') {
        o.operation.description = child.values[0] + '' || ''
      }
      return o
    },
    {
      errors: [] as OperationParseError[],
      operation: {
        description: '',
        request: undefined,
        responses: [] as Response[],
        authenticated: false,
      } as {
        request?: Request
        responses: Response[]
        description: string
        authenticated: boolean
      },
    }
  )

const prefixPath = (path: string, routes: Route[]): Route[] =>
  routes.map((route) => ({
    ...route,
    path: path + route.path,
    subroutes: prefixPath(path, route.subroutes),
  }))

const parseRoute = (
  node: kdljs.Node
): { routes: Route[]; errors: RouteParseError[] } => {
  const routes = [] as Route[]
  const errors = [] as RouteParseError[]
  let path = node.values[0] || ''
  if (!path) {
    errors.push({ path: '(no path)', details: 'No path given' })
  } else if (typeof path !== 'string') {
    path = ''
    errors.push({ path, details: 'Path must be string' })
  } else if (!path.startsWith('/')) {
    path = '/' + path
  }

  const operations = Object.fromEntries(
    node.children
      .filter((child) => HTTP_VERBS.includes(child.name as HTTPVerb))
      .map((child) => {
        const { errors: operationErrors, operation } = parseOperation(child)

        errors.push(
          ...operationErrors.map((e) => {
            if (typeof e === 'string' || 'error' in e) {
              return {
                path: path as string,
                details: e,
              }
            } else {
              return e
            }
          })
        )
        return [child.name as HTTPVerb, operation]
      })
  )

  const route = {
    path: path as string,
    operations,
    subroutes: [],
  } as Route

  routes.push(route)

  node.children
    .filter((node) => node.name === 'route')
    .map(parseRoute)
    .map(({ routes, errors: subrouteErrors }) => {
      errors.concat(subrouteErrors)
      return prefixPath(path as string, routes)
    })
    .forEach((subroutes) =>
      subroutes.forEach((subroute) => route.subroutes.push(subroute))
    )

  return { routes, errors }
}

export const parseRoutesFromDocument = (document: kdljs.Document) => {
  const { routes, errors } = document
    .filter((node) => node.name === 'route')
    .reduce(
      ({ routes, errors }, node) => {
        const { routes: rs, errors: e } = parseRoute(node)

        const dupRoutes: string[] = []
        // Filter duplicates
        // Barely readable but I don't care
        // Checks if there are any routes currently existing with the same path
        // as one of the nodes that we're about to add
        if (
          // If there is some existing route¹ for which...
          routes.some((existingRoute) =>
            // some route² of the new routes² we're adding...
            rs.some(
              // has the same path as that existing route¹...
              (newRoute) => {
                if (newRoute.path === existingRoute.path) {
                  // make a note of which path that is
                  dupRoutes.push(newRoute.path)
                  return true
                } else {
                  return false
                }
              }
            )
          )
        ) {
          // then make an error and don't add it.
          errors = errors.concat(
            dupRoutes.map((path) => ({
              path,
              details: 'Duplicate path',
            }))
          )
        }

        routes = routes.concat(
          rs.filter((route) => !dupRoutes.includes(route.path))
        )
        errors = errors.concat(e)

        return { routes, errors }
      },
      { routes: [] as Route[], errors: [] as RouteParseError[] }
    )
  return {
    routes: Object.fromEntries(routes.map((route) => [route.path, route])),
    errors,
  }
}
