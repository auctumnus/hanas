import {ApiProperty} from "@nestjs/swagger"

export const makeErrors = {
  
}

export class ApiError {
  /**
   * The HTTP status code of the error.
   * @example 400
   */
  @ApiProperty()
  statusCode: number

  /**
   * The message(s) describing the error.
   * @example An error of some sort occurred.
   */
  @ApiProperty()
  message: string | string[]
  
  /**
   * The name of the HTTP error.
   * @example Bad Request
   */
  @ApiProperty()
  error: string
}

