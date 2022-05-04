import { Paginated } from './pagination'

type SerializedT<T> = T | Paginated<T>

type Clean<T, K> = (arg0: T) => K

export const serializeFactory =
  <T, K>(clean: Clean<T, K>) =>
  (d: SerializedT<T>) => {
    if ('cursor' in d) {
      const { data, cursor } = d
      return {
        data: data.map(clean),
        cursor,
      }
    } else {
      return clean(d)
    }
  }
