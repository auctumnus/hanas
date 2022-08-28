import { exclude } from '../exclude'
import { serializeFactory } from '../serialization'

export const serialize = serializeFactory(
  exclude('id', 'kratosID', 'etag', 'createdById', 'lastUpdatedById', 'langID')
)
