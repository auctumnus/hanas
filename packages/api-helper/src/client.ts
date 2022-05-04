import { HanasClientOptions, parseOptions } from './options'
import { login } from './kratos'
import { user } from './handlers/user'

/**
 * The class through which requests can be made.
 */
export class HanasClient {
  /**
   * Create a Hanas client.
   * @param options
   */
  constructor(public options: HanasClientOptions) {
    this.options = parseOptions(options)
  }

  /**
   * Log in as the given user.
   * @param username
   * @param password
   */
  public async login(username: string, password: string) {
    const session = await login(this.options.kratosURL, username, password)

    if (typeof window !== 'undefined') {
      this.options.token = session.session_token
    }
  }

  get users() {
    return user(this)
  }
}
