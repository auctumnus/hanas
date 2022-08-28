/**
 * The Kratos API helper is huge and sucks. This provides common use-case
 * functionality for the Hanas API helper.
 **/

interface KratosSession {
  id: string
  active: boolean
  expires_at: string
  authenticated_at: string
  issued_at: string
  identity: {
    id: string
    schema_id: string
    schema_url: string
    state: string
    state_changed_at: string
    traits: {
      email: string
      username: string
    }
    created_at: string
    updated_at: string
  }
}

/**
 * This may be out-of-date with real Kratos responses, but it probably won't be.
 * If it is, please open an issue or PR.
 */
interface LoginResponse {
  session_token: string
  session: KratosSession
}

/**
 * This may be out-of-date with real Kratos responses, but it probably won't be.
 * If it is, please open an issue or PR.
 */
interface RegistrationResponse {
  session: KratosSession
  identity: KratosSession['identity'] // @kratos devs why
}

export interface ThrownKratosError extends Error {
  id: number
  text: string
  type: string
  context: any
  isKratosError: true
}

export const isKratosError = (e: unknown): e is ThrownKratosError => {
  return (
    // @ts-ignore
    Object.prototype.hasOwnProperty.call(e, 'isKratosError') && e.isKratosError
  )
}

interface KratosErrorResponse {
  id: string
  type: string
  expires_at: string
  issued_at: string
  request_url: string
  ui: {
    action: string
    method: string
    nodes: {
      type: string
      group: string
      attributes: {
        name: string
        type: string
        value: string
        required: boolean
        disabled: boolean
      }
      messages: {
        id: number
        text: string
        type: string
        context: {}
      }[]
      meta: string[]
    }[]
    messages: {
      id: number
      text: string
      type: string
      context: {}
    }[]
  }
}

// im saving single bytes at this point
let j = 'application/json'

interface fetchWrapperArgs {
  endpoint: string | URL
  path: string
  body?: any
  token?: string
  method?: string
}

const f = async <BodyType = any>({
  endpoint,
  path,
  body,
  token,
  method,
}: fetchWrapperArgs) =>
  await fetch(new URL(path, endpoint) + '', {
    headers: {
      'Content-Type': j,
      Accept: j,
      'X-Session-Token': token ? token : '',
    },
    credentials: 'include',
    method: method ? method : body ? 'POST' : 'GET',
    body: JSON.stringify(body),
  }).then(async (r) => {
    if (r.status === 204) return {} as BodyType
    else if (!r.ok) throw await r.json()
    else return (await r.json()) as BodyType
  })

const throwKratosError = (e: unknown) => {
  const err = e as KratosErrorResponse
  if ('ui' in err && 'messages' in err.ui && err.ui.messages.length) {
    const message = err.ui.messages[0]
    const { id, type, text, context } = message
    const error = new Error(text) as ThrownKratosError
    error.id = id
    error.type = type
    error.message = text
    error.text = text
    error.context = context
    error.isKratosError = true
    throw error
  } else {
    console.error(e)
    throw new Error('error in kratos, see error above')
  }
}

const kind = typeof window === 'undefined' ? 'api' : 'browser'

const getCSRF = (o: unknown) =>
  (o as KratosErrorResponse).ui.nodes.filter(
    (n) => n.attributes.name === 'csrf_token'
  )[0].attributes.value as string

/**
 * Registers a user with Hanas.
 * @param endpoint The Kratos endpoint.
 * @param email
 * @param username
 * @param password
 * @returns
 */
export const register = async (
  endpoint: string | URL,
  email: string,
  username: string,
  password: string
) => {
  const api = await f({
    endpoint,
    path: `/self-service/registration/${kind}`,
  })
  if (!api || !api.id || typeof api.id !== 'string') {
    throw new Error(
      "Couldn't register; the Kratos response object was malformed. " +
        'The response received should be logged above.'
    )
  }

  const csrf = getCSRF(api)

  const { id } = api
  try {
    return await f<RegistrationResponse>({
      endpoint,
      path: `/self-service/registration?flow=${id}`,
      body: {
        'traits.email': email,
        'traits.username': username,
        password,
        method: 'password',
        //csrf_token: csrf,
      },
    })
  } catch (e) {
    return throwKratosError(e)
  }
}

/**
 * Logs the user into Hanas.
 * If an error occurs, an error will be thrown.
 * @param endpoint The Kratos endpoint.
 * @param username
 * @param password
 * @throws {@see ThrownKratosError} on any error that Kratos sends a UI message for.
 * @returns The response object. This includes user information, as well as
 * the session token. If you're in the browser, **DO NOT** store the session
 * token, as the browser can already handle the cookie from Kratos and will
 * authenticate just fine.
 */
export const login = async (
  endpoint: string | URL,
  username: string,
  password: string
) => {
  const api = await f({
    endpoint,
    path: `/self-service/login/${kind}`,
  })

  if (!api || !api.id || typeof api.id !== 'string') {
    throw new Error(
      "Couldn't log in; the Kratos response object was malformed. " +
        'The response received should be logged above.'
    )
  }
  const { id } = api

  const csrf = getCSRF(api)

  try {
    return await f<LoginResponse>({
      endpoint,
      path: `/self-service/login?flow=${id}`,
      body: {
        password_identifier: username,
        password,
        method: 'password',
        csrf_token: csrf,
      },
    })
  } catch (e) {
    return throwKratosError(e)
  }
}

/**
 * Sends a whoami request to Kratos.
 * @param endpoint
 * @param token
 * @returns Information about the currently logged-in user.
 */
export const whoami = (endpoint: string | URL, token?: string) =>
  f({
    endpoint,
    path: '/sessions/whoami',
    token,
  })

/**
 * Logs the user out of Kratos.
 * @param endpoint
 * @param token
 * @returns
 */
export const logout = async (endpoint: string | URL, token?: string) => {
  if (kind === 'api') {
    if (!token) {
      throw new Error(
        'For non-browser clients, a token must be passed to logout.'
      )
    }
    return f({
      endpoint,
      path: `/self-service/logout/api?session_token=${token}`,
      method: 'DELETE',
    })
  } else {
    const { logout_url } = await f<{
      logout_url: string
    }>({
      endpoint,
      path: `/self-service/logout/browser`,
    })

    const logoutToken = new URL(logout_url).searchParams.get('token')

    return f({
      endpoint,
      path: `/self-service/logout?token=${logoutToken}`,
    }).then((r) => r.body)
  }
}
