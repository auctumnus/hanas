import { config } from 'dotenv-defaults'
import { parse } from 'bytes'
config()

// port
export const PORT = Number(process.env.PORT)

// database settings
export const DEFAULT_PAGE_SIZE = Number(process.env.DEFAULT_PAGE_SIZE)
export const MAX_PAGE_SIZE = Number(process.env.MAX_PAGE_SIZE)
export const SALT_ROUNDS = Number(process.env.SALT_ROUNDS)
for (const variable of [DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, SALT_ROUNDS]) {
  if (Number.isNaN(variable)) throw new Error(`Invalid number for ${variable}!`)
}
// load db settings
let dbconfig: any
try {
  dbconfig = JSON.parse(process.env.DATABASE_CONFIG_JSON)
} catch (err) {
  console.error('Bad JSON in DATABASE_CONFIG_JSON!')
  throw new Error(err)
}

export const databaseConfig = dbconfig

// jwt settings
export const ACCESS_JWT_SECRET = String(process.env.ACCESS_JWT_SECRET)
export const REFRESH_JWT_SECRET = String(process.env.REFRESH_JWT_DURATION)
export const ACCESS_JWT_DURATION = String(process.env.ACCESS_JWT_DURATION)
export const REFRESH_JWT_DURATION = String(process.env.REFRESH_JWT_DURATION)

// aws settings
export const AWS_REGION = String(process.env.AWS_REGION)
export const AWS_BUCKET = String(process.env.AWS_BUCKET)
export const CLOUDFRONT_DOMAIN = String(process.env.CLOUDFRONT_DOMAIN)
export const AWS_ENDPOINT = String(process.env.AWS_ENDPOINT)

// file settings
export const MAX_FILE_SIZE = parse(String(process.env.MAX_FILE_SIZE))
export const ALLOWED_TYPES = String(process.env.ALLOWED_TYPES).split(',')
// export const ENABLE_GIF_PFP = String(process.env.ENABLE_GIF_PFP)
export const PFP_MAX_LENGTH = Number(process.env.PFP_MAX_LENGTH)
export const BANNER_MAX_HEIGHT = Number(process.env.BANNER_MAX_HEIGHT)
export const BANNER_MAX_WIDTH = Number(process.env.BANNER_MAX_WIDTH)
export const FLAG_MAX_WIDTH = Number(process.env.FLAG_MAX_WIDTH)
export const FLAG_MAX_HEIGHT = Number(process.env.FLAG_MAX_HEIGHT)

for (const variable of [
  PFP_MAX_LENGTH,
  BANNER_MAX_WIDTH,
  BANNER_MAX_HEIGHT,
  FLAG_MAX_WIDTH,
  FLAG_MAX_HEIGHT,
]) {
  if (Number.isNaN(variable)) throw new Error(`Invalid number for ${variable}!`)
}
