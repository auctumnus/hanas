import { HanasClientOptions, parseOptions } from './options'
import { login, logout, register, whoami } from './kratos'
import { user } from './handlers/user'
import { makeAuthedWrapper, makePaginator } from './fetch-wrapper'
import { User } from './models'
import { lang } from './handlers/lang'

/**
 * The class through which requests can be made.
 */
export class HanasClient {
  #authed = false

  fetch: ReturnType<typeof makeAuthedWrapper>
  paginatedFetch: ReturnType<typeof makePaginator>

  /**
   * Create a Hanas client.
   * @param options
   */
  constructor(public options: HanasClientOptions) {
    this.options = parseOptions(options)
    this.fetch = makeAuthedWrapper(this)
    this.paginatedFetch = makePaginator(this)
  }

  /**
   * Registers a new user with Hanas.
   * @param email The email to associate the user with.
   * @param username
   * @param password
   */
  public async register(email: string, username: string, password: string) {
    await register(this.options.kratosURL, email, username, password)
    await this.login(username, password)
  }

  /**
   * Log in as the given user.
   * @param username
   * @param password
   */
  public async login(username: string, password: string) {
    const { session_token } = await login(
      this.options.kratosURL,
      username,
      password
    )

    if (typeof window === 'undefined') {
      this.options.token = session_token
    }

    this.#authed = true
  }

  /**
   * Send a whoami to Kratos.
   * @returns Information about the current session from Kratos.
   */
  private whoami() {
    if (!this.#authed) {
      console.error('trying to get current user when not logged in')
    }

    return whoami(this.options.kratosURL, this.options.token)
  }

  /**
   * Log the current user out of Hanas.
   * @returns
   */
  public logout() {
    if (!this.#authed) {
      console.error('trying to log out when not logged in')
    }

    delete this.options.token

    this.#authed = false

    return logout(this.options.kratosURL, this.options.token)
  }

  /**
   * Whether or not this client is logged in.
   */
  get isLoggedIn() {
    return this.#authed
  }

  /**
   * Gets the user who is logged in through this client.
   * Will also check if the user is logged in without the
   * client knowing (e.g. in a browser with cookies).
   * @returns Information about the logged-in user.
   */
  public async currentUser() {
    try {
      const whoami = await this.whoami()
      // @ts-ignore
      const username: string = whoami.identity.traits.username

      const user = await this.users.get(username)
      if (!this.#authed && user) {
        this.#authed = true
      }
      return user
    } catch (e) {
      // @ts-ignore
      if ('error' in e && e.error.code === 401) {
        return null
      } else {
        throw e
      }
    }
  }

  /**
   * Ping the Hanas server.
   * @returns Basic information about the Hanas instance.
   */
  public ping() {
    return this.fetch<
      { error: false; data: { version: string; timestamp: string } },
      never
    >('/').then(({ error, data }) => ({
      error,
      data: { version: data.version, timestamp: new Date(data.timestamp) },
    }))
  }

  /**
   * User endpoints.
   */
  get users() {
    return user(this)
  }

  /**
   * Language endpoints.
   */
  get langs() {
    return lang(this)
  }
}
