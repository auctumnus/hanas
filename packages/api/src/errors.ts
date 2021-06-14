import { HttpStatus } from '@nestjs/common'
import { ApiProperty, ApiResponseOptions } from '@nestjs/swagger'

export const makeErrors = {}

export class ApiError {
  /**
   * The HTTP status code of the error.
   * @example 400
   */
  @ApiProperty({
    description: 'The HTTP status code of the error.',
    example: 400,
  })
  statusCode: number

  /**
   * The message(s) describing the error, or just the HTTP error.
   * @example An error of some sort occurred.
   */
  @ApiProperty({
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    description: 'The message(s) describing the error, or just the HTTP error.',
    example: 'An error of some sort occurred.',
  })
  message: string | string[]

  /**
   * The name of the HTTP error, if `message` has more specific information.
   * @example Bad Request
   */
  @ApiProperty({
    description:
      'The name of the HTTP error, if `message` has more specific information.',
    example: 'Bad Request',
  })
  error?: string
}

export class BadRequestError extends ApiError {
  @ApiProperty({
    example: 400,
  })
  statusCode: number

  @ApiProperty({
    example: ['description must be shorter than 5000 characters'],
  })
  message: string | string[]

  @ApiProperty({
    example: 'Bad Request',
  })
  error?: string
}

export class UnauthorizedError extends ApiError {
  @ApiProperty({
    example: 401,
  })
  statusCode: number

  @ApiProperty({
    example: 'No suitable authentication was provided.',
  })
  message: string | string[]

  @ApiProperty({
    example: 'Unauthorized',
  })
  error?: string
}

export class ForbiddenError extends ApiError {
  @ApiProperty({
    example: 403,
  })
  statusCode: number

  @ApiProperty({
    example: 'User does not have permission to change this resource.',
  })
  message: string | string[]

  @ApiProperty({
    example: 'Forbidden',
  })
  error?: string
}

export class NotFoundError extends ApiError {
  @ApiProperty({
    example: 404,
  })
  statusCode: number

  @ApiProperty({
    example: 'No user by this username was found.',
  })
  message: string | string[]

  @ApiProperty({
    example: 'Not Found',
  })
  error?: string
}

export class ConflictError extends ApiError {
  @ApiProperty({
    example: 409,
  })
  statusCode: number

  @ApiProperty({
    example: 'ID already in use',
  })
  message: string | string[]

  @ApiProperty({
    example: 'Conflict',
  })
  error?: string
}

export const apiError: ApiResponseOptions = { type: ApiError }
