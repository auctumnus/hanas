import { Paginated } from './pagination'

type SerializedT<T> = T | Paginated<T>

type Clean<T, K> = (arg0: T) => K

export const serializeFactory =
  <T, K>(clean: Clean<T, K>) =>
  (d: SerializedT<T>) => {
    if ('cursor' in d) {
      const { data, cursor } = d
      return {
        data: data.map(clean).map((v) => {
          if ('data' in v) {
            // @ts-ignore
            return v.data as K
          } else {
            return v
          }
        }),
        cursor,
        error: false,
      }
    } else {
      return {
        data: clean(d),
        error: false,
      }
    }
  }
