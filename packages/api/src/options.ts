import { Request, Response } from 'express'

export const options = (methods: string) => (_: Request, res: Response) =>
  res.set('Allow', methods).status(204).send('')
