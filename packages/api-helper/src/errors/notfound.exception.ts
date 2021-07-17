import { HanasException } from './hanas.exception'

/**
 * The request returned a 404; the entity requested does not exist.
 */
export class NotFoundException extends HanasException {
  constructor(message?: string) {
    super(message || 'Resource was not found.')
  }
}
