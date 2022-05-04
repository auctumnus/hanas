import { makeServer } from './server'
import { env, log as _log } from 'backend-shared'

const { EVENTS_PORT } = env
const { log } = _log

makeServer().listen(EVENTS_PORT, () => log('Started events server!'))
