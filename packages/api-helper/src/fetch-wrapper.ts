import { HanasClient } from './client'

type FetchUrl = Parameters<typeof fetch>[0] | URL

type FetchBody = Parameters<typeof fetch>[1]

export type WrapperBody = FetchBody & {
  body?: any
  params?: Record<string, string>
}

export type HanasErrorResponse<
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
        message: ErrorInfo['status'] extends 400
          ? 'Input validation error; see issues for details'
          : ErrorInfo['message']
        issues: ErrorInfo['status'] extends 400 ? { message: string }[] : never
      }
    }

export class HanasError<
  ErrorInfo extends { status: number; message: string } = {
    status: number
    message: string
  }
> extends Error {
  message: ErrorInfo['message']
  status: ErrorInfo['status']
  issues: ErrorInfo['status'] extends 400 ? { message: string }[] : never
  constructor({ data }: HanasErrorResponse<ErrorInfo>) {
    super(data.message)
    this.message = data.message
    this.status = data.status
    this.issues = data.issues
  }
}

export const err = <E extends { status: number; message: string }>(
  e: HanasErrorResponse<E>
) => new HanasError<E>(e)

export type HanasSuccess<DataType = any> = {
  data: DataType
  error: false
}

export type HanasResponse<
  T,
  E extends { status: number; message: string } = {
    status: number
    message: string
  }
> = HanasErrorResponse<E> | HanasSuccess<T>

/**
 * Determines whether the response is an error or not.
 * @param res The response to check.
 * @returns True if the response is not an error.
 */
export const isOk = <
  T,
  E extends { status: number; message: string } = {
    status: number
    message: string
  }
>(
  res: HanasResponse<T, E>
): res is HanasSuccess<T> => !res.error

/**
 * Determines whether the response is an error or not.
 * @param res The response to check.
 * @returns True if the response is an error.
 */
export const isErr = <
  T,
  E extends { status: number; message: string } = {
    status: number
    message: string
  }
>(
  res: HanasResponse<T, E>
): res is HanasErrorResponse<E> => res.error

/**
 * Simple fetch wrapper.
 * @typeparam DataType The type to cast the response to. If not given, defaults to any.
 * @typeparam ErrorStatus The statuses that can be returned in errors.
 * @typeparam ErrorMessage The messages that can be returned in errors.
 * @param url The full URL to send the request to.
 * @param opts Options for the request.
 * @returns The response, parsed to an object.
 * @throws If the response cannot be parsed as JSON, throws an error.
 */
export const w = async <
  DataType = any,
  ErrorInfo extends { status: number; message: string } = {
    status: number
    message: string
  }
>(
  url: FetchUrl,
  opts: WrapperBody = {}
): Promise<HanasResponse<DataType, ErrorInfo>> => {
  const options: FetchBody = {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      ...opts.headers,
    },
    credentials: 'include',
  }

  if (options.body instanceof FormData) {
    // @ts-ignore
    delete options.headers['Content-Type']
  }

  const res = await fetch(
    url + '?' + new URLSearchParams(opts.params) + '',
    options
  )

  // Handle errors.
  if (!res.ok) {
    let error
    // Try to parse the error response as JSON. If we can't, throw an error,
    // and try to include the response body if possible.
    try {
      error = await res.json()
    } catch (e) {
      if (e instanceof Error && e.message.includes('invalid json')) {
        console.error(res)
        throw new Error('Response was not JSON.')
      } else {
        console.error(await res.text())
        throw res
      }
    }
    return error as HanasErrorResponse<ErrorInfo>
  }

  return res.json() as Promise<HanasSuccess<DataType>>
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
      ;(opts.headers as Record<string, string>)['Authorization'] =
        'Bearer ' + client.options.token
    }
    return w<ResponseType, ErrorInfo>(
      new URL(path, client.options.hanasURL),
      opts
    )
  }
  return wrapped
}

/**
 * Paginated container for data.
 */
export interface PaginatedResponse<T> {
  data: T[]
  cursor: {
    next: string | null
    previous: string | null
  }
  error: false
}

/**
 * Arguments for pagination.
 * Interface rather than simple parameters in prep for possible filtering / etc
 */
export interface PaginationArgs {
  take?: number
  cursor?: string
  params?: Record<string, string>
}

/**
 * A paginated response with helpers for retrieving the next and previous pages.
 */
export type PaginatedResponseWithHelper<
  T,
  E extends { status: number; message: string } = {
    status: number
    message: string
  }
> =
  | {
      data: T[]
      next?: () => Promise<PaginatedResponseWithHelper<T, E>>
      previous?: () => Promise<PaginatedResponseWithHelper<T, E>>
      error: false
    }
  | HanasErrorResponse<E>

/**
 * Creates a wrapper for pagination.
 * @param client The client to get auth and instance information from.
 */
export const makePaginator =
  (client: HanasClient) =>
  /**
   * Perform a paginated request.
   * @param path The endpoint to send the request to.
   * @param args The arguments for pagination.
   * @returns A paginated response, or an error.
   */
  async <
    DataType,
    ErrorInfo extends { status: number; message: string } = {
      status: number
      message: string
    },
    WrappedType = DataType
  >(
    path: string,
    { take, cursor, params }: PaginationArgs = {},
    wrap?: (data: DataType) => WrappedType
  ): Promise<PaginatedResponseWithHelper<WrappedType, ErrorInfo>> => {
    const w = makeAuthedWrapper(client)

    // We can throw away type information here since we need to overwrite it
    // with the paginated response type.
    const firstPage = await w(path, {
      params: {
        take: take ? take + '' : '10',
        cursor: cursor || '',
        ...params,
      },
    })

    const response = firstPage as unknown as
      | PaginatedResponse<DataType>
      | HanasErrorResponse<ErrorInfo>

    if (isErr(response)) {
      return response
    }

    const { data, cursor: c } = response

    // TODO: I would really like to remove this, but it would probably mean
    // making the type signature way more evil.
    wrap = wrap ? wrap : (d) => d as unknown as WrappedType

    return {
      data: data.map(wrap),
      next: c.next
        ? () =>
            makePaginator(client)<DataType, ErrorInfo, WrappedType>(
              path,
              {
                take,
                cursor: c.next!,
              },
              wrap
            )
        : undefined,
      previous: c.previous
        ? () =>
            makePaginator(client)<DataType, ErrorInfo, WrappedType>(
              path,
              {
                take,
                cursor: c.previous!,
              },
              wrap
            )
        : undefined,
      error: false,
    }
  }
