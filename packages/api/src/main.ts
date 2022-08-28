import { makeServer } from './server'
import { HANAS_PORT } from './env'
import { log } from './log'

// @ts-ignore
makeServer().listen(HANAS_PORT, '0.0.0.0', 511, () =>
  log(`Started Hanas on port ${HANAS_PORT}!`)
)
