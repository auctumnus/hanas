import { ObjectType, Repository, SelectQueryBuilder } from 'typeorm'
import { decode } from 'base-64'
import { BadRequestException } from '@nestjs/common'
import { buildPaginator } from 'typeorm-cursor-pagination'
import { classToClass } from 'class-transformer'
import { Request } from 'express'
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from './constants'
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiProperty,
  ApiResponseOptions,
  getSchemaPath,
} from '@nestjs/swagger'

export class Cursor {
  /**
   * The cursor for the previous page of results.
   * @example aW50ZXJuYWxfaWQ6OA==
   */
  @ApiProperty()
  beforeCursor: string | null
  /**
   * The cursor for the next page of results.
   * @example aW50ZXJuYWxfaWQ6Nw==
   */
  @ApiProperty()
  afterCursor: string | null
}

export class Paginated<E> {
  /**
   * Cursor information for this request.
   */
  @ApiProperty()
  cursor: Cursor
  /**
   * Array of results.
   */
  data: E[]
}

export const pagedSchema = (e: string | Function): ApiResponseOptions => ({
  schema: {
    allOf: [
      { $ref: getSchemaPath(Paginated) },
      {
        properties: {
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(e) },
          },
        },
      },
    ],
  },
})

export async function paginator<T extends ObjectType<T>>(
  entity: T,
  repository: Repository<any> | SelectQueryBuilder<any>,
  key: string,
  limit: number,
  cursor?: string,
) {
  if (cursor) {
    let decoded: string
    try {
      decoded = decode(cursor)
    } catch (err) {
      throw new BadRequestException('Cursor is not valid base64.')
    }
    if (!decoded.startsWith(key)) {
      throw new BadRequestException('Cursor is invalid.')
    }
  }
  const paginator = buildPaginator({
    entity,
    paginationKeys: [key as Extract<keyof T, string>],
    query: {
      afterCursor: cursor || null,
      limit,
    },
  })
  const qb =
    repository instanceof SelectQueryBuilder
      ? repository
      : repository.createQueryBuilder()
  const result = await paginator.paginate(qb)
  result.data = classToClass(result.data)
  return result
}

export const getLimitAndCursor = (req: Request) => {
  const limit = +req.query.limit || DEFAULT_PAGE_SIZE
  if (limit > MAX_PAGE_SIZE) {
    throw new BadRequestException(
      `Limit for returned number of objects is ${MAX_PAGE_SIZE}.`,
    )
  }

  let cursor: string
  if (req.query.cursor && typeof req.query.cursor === 'string') {
    cursor = req.query.cursor
  } else if (req.query.cursor) {
    throw new BadRequestException('Cursor must be a string.')
  }
  return { limit, cursor }
}
