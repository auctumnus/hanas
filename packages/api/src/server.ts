import express, { ErrorRequestHandler } from 'express'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { userMiddleware } from './auth'
import { hooks } from './hooks'
import { version } from '../package.json'
import { STATUS_CODES } from 'http'
import { ZodError } from 'zod'
import cors from 'cors'

import { userRouter } from './user'
import { langRouter } from './lang'
import { inviteRouter } from './invite'

/**
 * Handles errors, ensuring we should always send JSON errors.
 */
const errorHandler: ErrorRequestHandler = (err, _, res, next) => {
  // As specified in https://expressjs.com/en/guide/error-handling.html, we do
  // need to fall back to the default Express error handler in some rare
  // situations.
  if (res.headersSent) next()

  const status = err.status || err.statusCode || err.code || 500
  const message = err.message || STATUS_CODES[status]
  const production = process.env.NODE_ENV !== 'production'

  if (err instanceof ZodError) {
    res.status(status).json({
      error: true,
      data: {
        status,
        message: 'Input validation error; see issues for details',
        issues: err.issues,
      },
    })
  } else {
    res.status(status).json({
      error: true,
      data: {
        status,
        message,
        stack: production ? undefined : err.stack,
      },
    })
  }
}

const corsHandler = cors({
  origin: 'http://localhost:3333',
  credentials: true,
  preflightContinue: true,
})

/**
 * Creates a Hanas server.
 * @returns A Hanas server instance.
 */
export const makeServer = () =>
  express()
    .use((_, res, next) => {
      // http://www.gnuterrypratchett.com/index.php
      res.set('X-Clacks-Overhead', 'GNU Terry Pratchett')
      next()
    })
    .use(corsHandler)
    // @ts-ignore
    .options('*', corsHandler)
    .use(helmet())
    .use(express.json())
    .use(cookieParser())
    .use(userMiddleware)
    .use('/hooks', hooks)
    .get('/', (_, res) =>
      res.status(200).json({
        error: false,
        data: {
          version,
          timestamp: new Date().toISOString(),
        },
      })
    )
    .use('/users', userRouter)
    .use('/langs', langRouter)
    .use('/invites', inviteRouter)
    .use(errorHandler)
