const DEFAULT_OPTIONS = {}

/**
 * Options for the Hanas client.
 */
export interface HanasClientOptions {
  /**
   * The base URL to send Hanas requests to.
   *
   * @example https://api.hanas.app
   */
  hanasURL: string | URL

  /**
   * The URL to send Kratos requests to.
   *
   * @example https://kratos.hanas.app
   */
  kratosURL: string | URL

  /**
   * The URL to send announcements server requests to.
   *
   * @example https://announcements.hanas.app
   */
  announcementsURL?: string | URL

  /**
   * The URL to establish an events server connection with.
   *
   * @example https://events.hanas.app
   */
  eventsURL?: string | URL

  /**
   * You can ignore this in the browser, since the browser supports cookies,
   * and storing the token in JS is a security risk!
   *
   * In Node, though, all the code we run is trusted, and we don't have cookies
   * persisting across the requests we make. Thus, we need to store this
   * somewhere else and keep it across requests.
   *
   * You don't need to store this yourself unless you're needing to keep it around
   * between runs.
   *
   * @example m3UdjlyXyUWNs136tfEiBDHOCIdTWzE0
   */
  token?: string
}

/**
 * Parses the given options, cleaning them up for the client.
 *
 * @internal
 * @param options The options to parse.
 * @returns Cleaned options.
 */
export const parseOptions = (options: HanasClientOptions) => {
  const o = { ...DEFAULT_OPTIONS, ...options }

  // This code is a little confusing. What it's doing is going through these
  // keys of the object, and passing it through `new URL` to ensure it's a
  // valid URL, then setting that option back to the origin of the url just
  // in case.
  // I would separate it out to a separate function, but I'm honestly not sure
  // how to write the function signature.
  for (const u of [
    'hanasURL',
    'kratosURL',
    'eventsURL',
    'announcementsURL',
  ] as const) {
    try {
      if (!o[u]) continue
      o[u] = new URL(o[u]!)
    } catch (e) {
      if (e instanceof TypeError) {
        console.error(
          `Couldn't parse "${o[u]}" into a valid URL.\n` +
            `This error happened trying to evaluate the options for the Hanas ` +
            `client; the bad url is in the option ${u}.`
        )
      }
      throw e
    }
  }

  return o
}
