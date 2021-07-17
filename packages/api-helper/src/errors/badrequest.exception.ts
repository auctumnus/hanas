import { HanasException } from './hanas.exception'

/**
 * The request was invalid in some way.
 */
export class BadRequestException extends HanasException {
  constructor(message?: string) {
    super(message || 'Invalid request.')
  }
}

