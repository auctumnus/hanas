/**
 * The Kratos API helper is huge and sucks. This provides common use-case
 * functionality for the Hanas API helper.
 */
import 'isomorphic-unfetch'

/**
 * This may be out-of-date with real Kratos responses, but it probably won't be.
 * If it is, please open an issue or PR.
 */
interface LoginResponse {
  session_token: string
  session: {
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
}

const f = async (endpoint: string | URL, path: string, body?: any) =>
  await fetch(new URL(path, endpoint) + '', {
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    method: body ? 'POST' : 'GET',
    body: JSON.stringify(body),
  }).then(async (r) => {
    if (!r.ok) throw new Error(await r.text())
    else return await r.json()
  })

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
  const api = await f(endpoint, '/self-service/login/api')

  if (!api || !api.id || typeof api.id !== 'string') {
    throw new Error(
      "Couldn't log in; the Kratos response object was malformed. " +
        'The response received should be logged above.'
    )
  }
  const { id } = api

  return (await f(endpoint, `/self-service/login?flow=${id}`, {
    password_identifier: username,
    password,
    method: 'password',
  })) as LoginResponse
}
