import { HanasException } from './hanas.exception'

/**
 * Used for unimplemented methods within the API helper.
 */
export class UnimplementedException extends HanasException {
  constructor(message?: string) {
    super(message || 'This is not yet implemented!')
  }
}

