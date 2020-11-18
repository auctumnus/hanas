import { ObjectType, Repository } from 'typeorm'
import { decode } from 'base-64'
import { BadRequestException } from '@nestjs/common'
import { buildPaginator } from 'typeorm-cursor-pagination'
import { classToClass } from 'class-transformer'

export async function paginator<T extends ObjectType<T>>(
  entity: T,
  repository: Repository<any>,
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
  const result = await paginator.paginate(repository.createQueryBuilder())
  result.data = classToClass(result.data)
  return result
}
