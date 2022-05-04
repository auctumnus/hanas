import { makeServer } from './server'
import { HANAS_PORT } from './env'
import { log } from './log'

makeServer().listen(HANAS_PORT, () =>
  log(`Started Hanas on port ${HANAS_PORT}!`)
)
