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

export interface IHanasError<Status, Message> {
  error: true
  data: {
    status: Status
    message: Message
    issues: Status extends 400 ? { message: string }[] : never
  }
}

export type HanasError<Status = number, Message = string> = Status extends never
  ? never
  : IHanasError<Status, Message>
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
  ErrorStatus = number,
  ErrorMessage = string
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
      return error as HanasError<ErrorStatus, ErrorMessage>
    } catch (e) {
      console.error(await res.text())
      throw res
    }
  }
  return res.json() as Promise<ResponseType>
}

const _awf =
  (client: HanasClient) =>
  <ResponseType = any, ErrorStatus = number, ErrorMessage = string>(
    path: string,
    opts: WrapperBody = {}
  ) =>
  (otherOpts: WrapperBody = {}) =>
    w<ResponseType, ErrorStatus, ErrorMessage>(
      new URL(path, client.options.hanasURL),
      {
        ...opts,
        ...otherOpts,
        ...(client.options.token
          ? {
              headers: {
                'X-Session-Token': client.options.token,
                ...opts.headers,
                ...otherOpts.headers,
              },
            }
          : {}),
      }
    )

/**
 * Creates a fetch wrapper that uses URL and auth information from the client.
 * @param client The client to use.
 * @returns A fetch wrapper.
 * @see {@link w}
 */
export const authWrapperFactory =
  (client: HanasClient) =>
  <ResponseType = any, ErrorStatus = number, ErrorMessage = string>(
    path: string,
    opts: WrapperBody = {}
  ) =>
    _awf(client)<ResponseType, ErrorStatus, ErrorMessage>(path, opts)()

/**
 * Contains information for a paginated response.
 * @typeparam ResponseType The type of the response data.
 */
export class PagedResponse<
  ResponseType = any,
  ErrorStatus = number,
  ErrorMessage = string
> {
  constructor(
    private readonly _data: ResponseType[],
    private readonly nextCursor: string | null,
    private readonly prevCursor: string | null,
    private readonly client: HanasClient,
    private readonly path: string,
    private readonly opts: WrapperBody
  ) {}

  public readonly error = false

  /**
   * Returns the next page for this paginated endpoint.
   * @param take The number of results to take.
   * @returns Either another paginated response, null (for no next page), or an error.
   */
  async next(
    take = 10
  ): Promise<
    | PagedResponse<ResponseType, ErrorStatus, ErrorMessage>
    | HanasError<ErrorStatus, ErrorMessage>
    | null
  > {
    if (this.nextCursor === null) {
      return null
    }

    if (!this.opts.params) {
      this.opts.params = {}
    }

    this.opts.params.cursor = this.nextCursor
    this.opts.params.take = take + ''

    return paginated(this.client)<ResponseType, ErrorStatus, ErrorMessage>(
      this.path,
      this.opts
    )
  }

  /**
   * Returns the previous page for this paginated endpoint.
   * @param take The number of results to take.
   * @returns Either another paginated response, null (for no previous page), or an error.
   */
  previous(
    take = 10
  ): Promise<
    | PagedResponse<ResponseType, ErrorStatus, ErrorMessage>
    | HanasError<ErrorStatus, ErrorMessage>
    | null
  > {
    if (this.prevCursor === null) {
      return null
    }

    if (!this.opts.params) {
      this.opts.params = {}
    }

    this.opts.params.cursor = this.prevCursor
    this.opts.params.take = take + ''

    return paginated(this.client)<ResponseType, ErrorStatus, ErrorMessage>(
      this.path,
      this.opts
    )
  }

  /**
   * @returns The data from this response.
   */
  getData() {
    return this._data
  }
}

export interface Paginated<T> {
  data: T[]
  cursor: {
    next: string | null
    previous: string | null
  }
}

/**
 * Creates a fetch wrapper with a paginated response.
 * @param client The client to use for the fetch wrapper.
 * @returns The fetch wrapper.
 * @see {@link w}
 * @see {@link authWrapperFactory}
 */
export const paginated =
  (client: HanasClient) =>
  async <ResponseType = any, ErrorStatus = number, ErrorMessage = string>(
    path: string,
    opts: WrapperBody = {}
  ): Promise<
    | PagedResponse<ResponseType, ErrorStatus, ErrorMessage>
    | HanasError<ErrorStatus, ErrorMessage>
    | null
  > => {
    const request = _awf(client)<
      Paginated<ResponseType>,
      ErrorStatus,
      ErrorMessage
    >(path, opts)
    const initialResponse = await request()

    if ('error' in initialResponse && initialResponse.error) {
      return initialResponse
    }

    const {
      data,
      cursor: { next, previous },
    } = initialResponse as Paginated<ResponseType>

    return new PagedResponse<ResponseType, ErrorStatus, ErrorMessage>(
      data,
      next,
      previous,
      client,
      path,
      opts
    )
  }
