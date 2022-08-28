import { err } from '../error'

export const langNotFound = err(404, 'No language was found by that code.')
