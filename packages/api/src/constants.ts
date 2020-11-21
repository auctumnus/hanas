import { config } from 'dotenv-defaults'
config()

export const DEFAULT_PAGE_SIZE = Number(process.env.DEFAULT_PAGE_SIZE)
export const MAX_PAGE_SIZE = Number(process.env.MAX_PAGE_SIZE)
export const SALT_ROUNDS = Number(process.env.SALT_ROUNDS)
for (const variable of [DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, SALT_ROUNDS]) {
  if (Number.isNaN(variable)) throw new Error(`Invalid number for ${variable}!`)
}

export const ACCESS_JWT_SECRET = String(process.env.ACCESS_JWT_SECRET)
export const REFRESH_JWT_SECRET = String(process.env.REFRESH_JWT_DURATION)
export const ACCESS_JWT_DURATION = String(process.env.ACCESS_JWT_DURATION)
export const REFRESH_JWT_DURATION = String(process.env.REFRESH_JWT_DURATION)

let dbconfig
try {
  dbconfig = JSON.parse(process.env.DATABASE_CONFIG_JSON)
} catch (err) {
  console.error('Bad JSON in DATABASE_CONFIG_JSON!')
  throw new Error(err)
}

export const databaseConfig = dbconfig
