import { STATUS_CODES } from 'http'

class ErrorWithCode extends Error {
  code: number
  constructor(code: number, msg?: string) {
    super(msg || STATUS_CODES[code])
    this.code = code
  }
}

export const err = (code: number, details?: any) => {
  if (details instanceof Error) {
    // @ts-ignore
    details.code = code
    return details
  } else {
    return new ErrorWithCode(code, details)
  }
}
