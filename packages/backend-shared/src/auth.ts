import { Handler, Request } from 'express'
import { KRATOS_ADMIN_URL, KRATOS_PUBLIC_URL } from './env'
import got from 'got'
import { URL } from 'url'
import { error } from './log'
import { err } from './error'

/*
 * Authentication in Hanas is done using the separate service Kratos. Kratos is
 * an authentication service which implements a lot of the hard stuff for us,
 * and is pretty easy to integrate.
 *
 * When a user wishes to log into Hanas, they first need to make an account on
 * the Kratos instance, and log in from there. This process varies on whether
 * the user is a browser or not.
 *
 * In the case of a browser, Kratos will attach a cookie on the current domain.
 * We then check the Cookie header for it for finding the current user.
 * In the other case, a session token must come with the request. This token can
 * either be in the Authorization header, or in the X-Session-Token header. This
 * is to maintain compatability with both HTTP semantics and Kratos.
 */

/**
 * This is the part of the Kratos response that we care about.
 */
interface KratosResponseOk {
  identity: {
    id: string
    traits: {
      email: string
      username: string
    }
  }
}

/**
 * Gets the token out of the request.
 * @param req The Express request to get the token from.
 */
const getToken = (req: Request) =>
  req.headers.authorization?.split(' ')[1] ||
  (req.headers['X-Session-Token'] as string)

const makeHeader = (req: Request) =>
  getToken(req)
    ? { 'X-Session-Token': getToken(req) }
    : req.header('Cookie')
    ? { Cookie: req.header('Cookie') }
    : {}

/*  */
const whoami = new URL('/sessions/whoami', KRATOS_PUBLIC_URL)
const identity = (id: string) => new URL(`/identities/${id}`, KRATOS_ADMIN_URL)

/**
 * Adds a user object to the request.
 */
export const userMiddleware: Handler = (req, _res, next) =>
  got(whoami, {
    headers: makeHeader(req),
    responseType: 'json',
  })
    .then((kratosRes) => {
      const { identity } = kratosRes.body as KratosResponseOk
      // @ts-ignore
      req.user = {
        kratosID: identity.id,
        username: identity.traits.username,
        email: identity.traits.email,
      }
      next()
    })
    .catch(() => next())

/**
 * Gets a user from the request.
 * Normally one could just access req.user but Typescript dislikes this, for
 * good reason.
 * @param req The Express request object.
 * @returns The user's information. Returns undefined for these values if no authentication was given.
 */
export const getUser = (
  req: Request
): { kratosID?: string; username?: string; email?: string } => {
  return (
    // @ts-ignore
    req.user || { kratosID: undefined, username: undefined, email: undefined }
  )
}

export const updateUsername = (
  req: Request,
  kratosID: string,
  newUsername: string
) =>
  got
    .put(identity(kratosID), {
      json: {
        state: 'active',
        traits: {
          email: getUser(req).email,
          username: newUsername,
        },
      },
      responseType: 'json',
    })
    .then(() => true)
    .catch((e) => {
      error(e)
      throw e
    })

export const deleteUser = (kratosID: string) =>
  got
    .delete(identity(kratosID))
    .then(() => true)
    .catch((e) => {
      error(e)
      throw e
    })

/**
 * Ensures that the request is being made by an authenticated user.
 * Note that this is different from an _authorized_ user -
 * you still need to check they have permissions to
 * perform the action.
 */
export const authenticated: Handler = (req, res, next) => {
  const { username } = getUser(req)
  if (!username) {
    next(err(401, 'You must be authenticated to access this endpoint.'))
    return undefined
  }
  next()
}
