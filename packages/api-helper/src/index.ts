import axios from 'redaxios'
import { validateRefreshToken } from './tokens'
import { url } from 'eiki'

/**
 * Options for a Hanas API instance.
 */
export interface HanasApiOptions {
  /**
   * The refresh token to use. If it's expired, an UnauthorizedException will
   * be thrown.
   */
  refresh: string
  /**
   * The URL for the API - if it's served on an `/api` route or something similar,
   * include that. Defaults to the current location plus `/api`.
   */
  url: string
}

/**
 * Provides a wrapper for the Hanas API.
 */
export class HanasApi {
  /**
   * Options passed to the helper.
   */
  options: HanasApiOptions
  /**
   * Base URL for requests.
   */
  url: string

  private constructor(options: HanasApiOptions) {
    this.options = options
    this.url = options.url
  }

  /**
   * Creates an instance of the Hanas API helper.
   * @throws {Error} If the URL given is not a Hanas API.
   * @throws {UnauthorizedException} Refresh token must be present,
   * valid, and unexpired.
   */
  static async create(options: HanasApiOptions) {
    // check refresh token
    const username = validateRefreshToken(options.refresh)

    const windowUrl = window ? window.location.origin + '/api' : undefined
    if((!options.url && !windowUrl) || (!windowUrl && !url(options.url))) {
      throw new Error('No valid URL provided.')
    }

    // get url if not present; typescript can't tell that we've ruled out
    // windowUrl previously, so we need to have the assertion
    options.url = options.url || windowUrl!

    // check that the api is actually there
    const { data } = await axios.get(options.url)

    if (!data.timestamp || !data.version) {
      throw new Error('URL given is not a Hanas API.')
    }

    return new HanasApi(options)
  }


}

export * from './exports'

