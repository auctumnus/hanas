import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'

@Injectable()
export class ClacksMiddleware implements NestMiddleware {
  use(_req: Request, res: Response, next: NextFunction) {
    // see http://www.gnuterrypratchett.com/index.php
    res.set('X-Clacks-Overhead', 'GNU Terry Pratchett')
    next()
  }
}
