import { config } from 'dotenv-defaults'
import * as env from 'env-var'
import { statSync, readFileSync } from 'fs'
import { URL } from 'url'
import { join } from 'path'

/**
 * Converts a function that can throw errors into one that either returns
 * a result or returns null.
 * @param throwableFn The function to use. Its return value will be returned
 * from this function if it does not throw.
 * @returns Either the return value of the function, or null.
 */
const errToOption = <T>(throwableFn: () => T) => {
  try {
    return throwableFn()
  } catch (e) {
    return null
  }
}

// Set up config. This is so that the entire repo can be cloned, and a base
// .env file can be used for all services.
const doesPathExist = (p: string) => !!errToOption(() => statSync(p))
const cwd = process.cwd()
const fromCwd = (p: string) => join(cwd, p)

const envInCwd = fromCwd('.env')
const defaultsInCwd = fromCwd('.env.defaults')

const envInRoot = fromCwd('../../.env')
const defaultsInRoot = fromCwd('../../.env.defaults')

if (doesPathExist(envInCwd) || doesPathExist(defaultsInCwd)) {
  config()
} else if (doesPathExist(envInRoot) || doesPathExist(defaultsInRoot)) {
  config({ path: envInRoot, defaults: defaultsInRoot })
} else {
  console.error("Couldn't find .env or .env.defaults!")
}

const getPort = (s: string) => errToOption(() => new URL(s))?.port

// General setup section
export const DATABASE_URL = env.get('DATABASE_URL').required().asUrlString()
export const NODE_ENV = env.get('NODE_ENV').required().asString()
export const KRATOS_ADMIN_URL = env
  .get('KRATOS_ADMIN_URL')
  .required()
  .asUrlString()
export const KRATOS_PUBLIC_URL = env
  .get('KRATOS_PUBLIC_URL')
  .required()
  .asUrlString()
export const KRATOS_API_KEY = env.get('KRATOS_API_KEY').required().asString()

// Hanas API setup section
export const HANAS_URL = env.get('HANAS_URL').required().asUrlString()
export const HANAS_PORT = getPort(HANAS_URL)

export const HANAS_RESULTS_DEFAULT_PAGE_SIZE = env
  .get('HANAS_RESULTS_DEFAULT_PAGE_SIZE')
  .required()
  .asIntPositive()
export const HANAS_RESULTS_MAX_PAGE_SIZE = env
  .get('HANAS_RESULTS_MAX_PAGE_SIZE')
  .required()
  .asIntPositive()

// Events API setup section
export const ENABLE_EVENTS = env.get('ENABLE_EVENTS').asBoolStrict()
export const EVENTS_WS_URL = env.get('EVENTS_WS_URL').asUrlString()
export const EVENTS_HTTP_URL = env.get('EVENTS_PUBLIC_URL').asUrlString()
export const EVENTS_WS_PORT = getPort(EVENTS_WS_URL)
export const EVENTS_HTTP_PORT = getPort(EVENTS_HTTP_URL)
export const EVENTS_API_KEY = env.get('EVENTS_API_KEY').asString()

// Announcements API setup section
export const ENABLE_ANNOUNCEMENTS = env
  .get('ENABLE_ANNOUNCEMENTS')
  .asBoolStrict()
export const ANNOUNCEMENTS_URL = env.get('ANNOUNCEMENTS_URL').asUrlString()
export const ANNOUNCEMENTS_PORT = getPort(ANNOUNCEMENTS_URL)
export const ANNOUNCEMENTS_API_KEY = env.get('ANNOUNCEMENTS_API_KEY').asString()

export const STORAGE_ACCESS_KEY_ID = env.get('STORAGE_ACCESS_KEY_ID').asString()
export const STORAGE_SECRET_ACCESS_KEY = env
  .get('STORAGE_SECRET_ACCESS_KEY')
  .asString()
export const STORAGE_ENDPOINT = env.get('STORAGE_ENDPOINT').asString()
export const STORAGE_BUCKET_NAME = env.get('STORAGE_BUCKET_NAME').asString()
export const STORAGE_PUBLIC_URL = env.get('STORAGE_PUBLIC_URL').asString()
export const STORAGE_PORT = env.get('STORAGE_PORT').asPortNumber()
