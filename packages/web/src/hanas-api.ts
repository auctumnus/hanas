import { HanasClient } from '@hanas-app/api-helper'

const hanasURL = import.meta.env.HANAS_URL || 'http://localhost:1337'
const kratosURL = import.meta.env.HANAS_URL || 'http://localhost:4433'

export const client = new HanasClient({ hanasURL, kratosURL })
