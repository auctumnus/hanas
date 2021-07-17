import { UnauthorizedException } from './errors'
import { decode } from 'js-base64'
/**
 * Validate the refresh token, and get the username out of it.
 * Throws if invalid/missing.
 * @param token The refresh token to check.
 * @returns username The username of the user whom the refresh token is for.
 * @throws {UnauthorizedException} Throws if invalid, missing, or expired.
 */
export const validateRefreshToken = (token?: string) => {
  const invalid = new UnauthorizedException('Refresh token invalid.')
  if (!token) throw new UnauthorizedException('Refresh token missing.')
  const payload = token.split('.')[1]
  if (!payload) throw invalid
  try {
    const decoded = JSON.parse(decode(payload))
    // If decoded doesn't have the exp field, or if exp field is not a number.
    if (!decoded.exp || !(typeof decoded.exp === 'number')) {
      throw new UnauthorizedException()
    } else if (decoded.exp < Date.now()) {
      throw new UnauthorizedException('Refresh token expired.')
    } else {
      return decoded.username as string
    }
  } catch (e) {
    throw invalid
  }
}

