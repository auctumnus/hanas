import { exclude } from '../exclude'
import { serializeFactory } from '../serialization'

export const serialize = serializeFactory(
  exclude(
    'id',
    'etag',
    'createdById',
    'lastUpdatedById',
    'langID',
    'senderID',
    'receiverID'
  )
)
