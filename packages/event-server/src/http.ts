import express from 'express'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { auth } from 'backend-shared'

const { userMiddleware } = auth

export const makeHttpServer = () =>
  express()
    .use((_, res, next) => {
      // http://www.gnuterrypratchett.com/index.php
      res.set('X-Clacks-Overhead', 'GNU Terry Pratchett')
      next()
    })
    .use(helmet())
    .use(express.json())
    .use(cookieParser())
    .use(userMiddleware)
