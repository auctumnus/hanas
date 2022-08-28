import { Request, Response } from 'express'
import { emptySuccess } from './emptySuccess'

export const options = (methods: string) => (_: Request, res: Response) =>
  res.set('Allow', methods).status(200).send(emptySuccess)
