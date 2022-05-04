import { createServer } from 'http'
import { log as _log } from 'backend-shared'
import { makeWsServer } from './ws'
import { makeHttpServer } from './http'

const { error } = _log

export const makeServer = () => {
  const app = makeHttpServer()
  const server = createServer(app)
  const wss = makeWsServer()

  server.on('upgrade', async (req, socket, head) => {
    try {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req)
      })
    } catch (e) {
      error('Websocket upgrade failed!')
      socket.destroy()
    }
  })

  return server
}
