import { HanasException } from './hanas.exception'

/**
 * Used when the refresh token for authentication is not present, is invalid,
 * or has expired.
 */
export class UnauthorizedException extends HanasException {
  constructor(message?: string) {
    super(message || 'Refresh token either missing, invalid, or expired.')
  }
}
