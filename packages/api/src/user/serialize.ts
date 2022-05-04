import { serializeFactory } from '../serialization'
import { exclude } from '../exclude'

export const serialize = serializeFactory(exclude('id', 'kratosID', 'etag'))
