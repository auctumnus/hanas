/**
 * The Kratos API helper is huge and sucks. This provides common use-case
 * functionality for the Hanas API helper.
 */
import 'isomorphic-unfetch'

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

interface RegistrationFailedError {
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
}

const f = async <BodyType = any>({
  endpoint,
  path,
  body,
  token,
}: fetchWrapperArgs) =>
  await fetch(new URL(path, endpoint) + '', {
    headers: {
      'Content-Type': j,
      Accepts: j,
      'X-Session-Token': token ? token : '',
    },
    method: body ? 'POST' : 'GET',
    body: JSON.stringify(body),
  }).then(async (r) => {
    if (!r.ok) throw await r.json()
    else return (await r.json()) as BodyType
  })

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
  const api = await f({ endpoint, path: '/self-service/registration/api' })
  if (!api || !api.id || typeof api.id !== 'string') {
    throw new Error(
      "Couldn't register; the Kratos response object was malformed. " +
        'The response received should be logged above.'
    )
  }

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
      },
    })
  } catch (e) {
    const error = e as RegistrationFailedError
    // password is too common (lol, thx kratos)
    if (
      error.ui.nodes
        .filter((node) => node.attributes.name === 'password')[0]
        .messages.some((m) => m.id === 4000005)
    ) {
      throw new Error(
        'The password can not be used because the password has been found in data breaches and must no longer be used.'
      )
    }
    // user exists under these traits
    else if (error.ui.messages && error.ui.messages[0].id === 4000007) {
      throw new Error('A user with the same email or username already exists.')
    } else if (error.ui.messages && error.ui.messages.length) {
      throw new Error(error.ui.messages[0].text)
    } else {
      console.error(e)
      throw new Error(
        "Couldn't register; the Kratos response object was malformed. " +
          'The response received should be logged above.'
      )
    }
  }
}

/**
 * Logs the user into Hanas.
 * If an error occurs, an error will be thrown.
 * @param endpoint The Kratos endpoint.
 * @param username
 * @param password
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
  const api = await f({ endpoint, path: '/self-service/login/api' })

  if (!api || !api.id || typeof api.id !== 'string') {
    throw new Error(
      "Couldn't log in; the Kratos response object was malformed. " +
        'The response received should be logged above.'
    )
  }
  const { id } = api

  return f<LoginResponse>({
    endpoint,
    path: `/self-service/login?flow=${id}`,
    body: {
      password_identifier: username,
      password,
      method: 'password',
    },
  })
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
export const logout = async (endpoint: string | URL, token?: string) =>
  f({
    endpoint,
    path: '/self-service/logout',
    token,
  })
