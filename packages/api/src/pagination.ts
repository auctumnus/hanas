import { Request } from 'express'
import {
  HANAS_RESULTS_DEFAULT_PAGE_SIZE,
  HANAS_RESULTS_MAX_PAGE_SIZE,
} from './env'

export interface Paginated<T> {
  data: T[]
  cursor: {
    next: string | null
    previous: string | null
  }
}

/**
 * Pagination in Hanas is done using a cursor with a prefix. On any endpoint which
 * can return many values, the response will look like this:
 * {
 *   data: [
 *     { ... }
 *   ],
 *   cursor: {
 *     next: "next__cjld2cyuq0000t3rmniod1foy",
 *     previous: null
 *   }
 * }
 * The client can then pass a query parameter with `cursor` from the `next` or
 * `previous` to go to the page before or after.
 * The client can also specify the number of records that they would like, using
 * the `take` query parameter. This must be an integer value greater than 0 and
 * lower than the instance's HANAS_RESULTS_MAX_PAGE_SIZE.
 */

const getTake = (req: Request) => {
  const parsedTake = Number(req.query.take)
  return parsedTake <= HANAS_RESULTS_MAX_PAGE_SIZE &&
    parsedTake > 0 &&
    !Number.isNaN(parsedTake) &&
    Number.isInteger(parsedTake)
    ? parsedTake
    : HANAS_RESULTS_DEFAULT_PAGE_SIZE
}

const getCursor = (req: Request) => {
  if (typeof req.query.cursor === 'string') {
    const [prefix, cursor] = req.query.cursor.split('__')
    return {
      direction: prefix == 'prev' ? -1 : 1,
      cursor,
    }
  } else {
    return {
      direction: 1,
      cursor: undefined,
    }
  }
}

/**
 * Gets the values to pass to prisma.X.findMany.
 */
export const getPaginationVars = (
  req: Request
): {
  // If I don't include this type annotation Typescript thinks `cursor` is
  // `undefined?` for some unholy reason.
  cursor?: { id: string }
  take: number
  skip?: number
} => {
  const { direction, cursor } = getCursor(req)
  const take = (getTake(req) + 1) * direction

  if (cursor) {
    return {
      take,
      skip: 1,
      cursor: { id: cursor },
    }
  } else {
    return {
      take,
    }
  }
}

const next = (o: { id: string }) => 'next__' + o.id
const previous = (o: { id: string }) => 'prev__' + o.id

const last = (a: any[]) => a[a.length - 1]

interface ID {
  id: string
}

export const paginate = <T extends ID>(
  req: Request,
  data: T[]
): Paginated<T> => {
  const take = getTake(req)
  const { direction, cursor } = getCursor(req)

  const hasLastPage = !!cursor

  // There are a few possibilities for which data can be available in a given
  // direction.
  //
  // When a user requests data from the server, they specify a direction,
  // a cursor, and a page size (take). We then request data in that direction,
  // from that cursor, skipping the first one. We request the page size, plus one.
  // After that, we have to do different things depending on the amount of data:
  //  - If we get page_size + 1 records, we know that more data exists past
  //    the end of the page. We can thus take the last value in the page and
  //    use that as the cursor for the next page.
  //  - If we get less than that, we know that more data does not exist in
  //    this direction.
  // As far as the other direction, if we have a cursor present (and valid),
  // we just assume there's data in the other direction. If a user should
  // send an invalid cursor they're trying to elicit weird behavior so
  // we'll give them weird behavior.

  if (data.length === 0) {
    return {
      data: [],
      cursor: {
        previous: null,
        next: null,
      },
    }
  }

  if (data.length === take + 1) {
    // The length of the data here has to be at least 2.
    if (direction === -1) {
      data.shift()
      return {
        // Removes the first item.
        data,
        cursor: {
          previous: previous(data[0]),
          next: hasLastPage ? next(last(data)) : null,
        },
      }
    } else {
      data.pop()
      return {
        // This removes the last item.
        data,
        cursor: {
          previous: hasLastPage ? previous(data[0]) : null,
          next: next(data[data.length - 1]),
        },
      }
    }
  } else {
    // The length of the data here could be only 1.
    if (direction === -1) {
      // user wanted previous page
      return {
        data,
        cursor: {
          previous: null,
          // If we had a page after this, add the cursor for it.
          next: hasLastPage ? next(last(data)) : null,
        },
      }
    } else {
      // user wanted next page
      return {
        data,
        cursor: {
          // If we had a page before this, add the cursor for it.
          previous: hasLastPage ? previous(data[0]) : null,
          next: null,
        },
      }
    }
  }
}
