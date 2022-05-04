import { Server } from 'http'
import WebSocket, { WebSocketServer } from 'ws'

export const makeWsServer = () =>
  new WebSocketServer({
    noServer: true,
    clientTracking: true,
  }).on('connection', (ws, req) => {})
