import { Request, Response, NextFunction } from 'express'

export function clacks (_req: Request, res: Response, next: NextFunction) {
  // see http://www.gnuterrypratchett.com/index.php
  res.set('X-Clacks-Overhead', 'GNU Terry Pratchett')
  next()
}

