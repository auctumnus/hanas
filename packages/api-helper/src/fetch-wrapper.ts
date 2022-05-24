// Fetch polyfill. This is pretty small - in total about 600 bytes mingzipped.
// TODO: Is it possible to opt-out of this if you only target browsers with
// fetch?
import 'isomorphic-unfetch'
import { HanasClient } from './client'

type FetchUrl = Parameters<typeof fetch>[0] | URL

type FetchBody = Parameters<typeof fetch>[1]

export type WrapperBody = FetchBody & {
  body?: any
  params?: Record<string, string>
}

export type HanasError<
  ErrorInfo extends { status: number; message: string } = {
    status: number
    message: string
  }
> = ErrorInfo['status'] extends never
  ? never
  : {
      error: true
      data: {
        status: ErrorInfo['status']
        message: ErrorInfo['message']
        issues: ErrorInfo['status'] extends 400 ? { message: string }[] : never
      }
    }

/**
 * Simple fetch wrapper.
 * @typeparam ResponseType The type to cast the response to. If not given, defaults to any.
 * @typeparam ErrorStatus The statuses that can be returned in errors.
 * @typeparam ErrorMessage The messages that can be returned in errors.
 * @param url The full URL to send the request to.
 * @param opts Options for the request.
 * @returns The request, parsed to an object.
 * @throws If the request doesn't have `ok` set to true, throws an error.
 */
export const w = async <
  ResponseType = any,
  ErrorInfo extends { status: number; message: string } = {
    status: number
    message: string
  }
>(
  url: FetchUrl,
  opts: WrapperBody = {}
) => {
  const options: FetchBody = {
    ...opts,
    headers: {
      ...opts.headers,
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  }

  const res = await fetch(
    url + '?' + new URLSearchParams(opts.params) + '',
    options
  )

  if (!res.ok) {
    try {
      const error = await res.json()
      return error as HanasError<ErrorInfo>
    } catch (e) {
      console.error(await res.text())
      throw res
    }
  }
  return res.json() as Promise<ResponseType>
}

/**
 * Creates a fetch wrapper that can use auth information.
 * @param client The client to use auth/URL info from.
 * @returns
 */
export const makeAuthedWrapper = (client: HanasClient) => {
  /**
   * See the included wrapper, except the path is a string and
   * an endpoint on
   * @see {@link w}
   */
  const wrapped = <
    ResponseType = any,
    ErrorInfo extends { status: number; message: string } = {
      status: number
      message: string
    }
  >(
    path: string,
    opts: WrapperBody = {}
  ) => {
    if (!opts.headers) {
      opts.headers = {}
    }
    if (client.options.token) {
      ;(opts.headers as Record<string, string>)['X-Session-Token'] =
        client.options.token
    }
    return w<ResponseType, ErrorInfo>(
      new URL(path, client.options.hanasURL),
      opts
    )
  }
  return wrapped
}
