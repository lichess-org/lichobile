/*
 * Web Worker responsible for all websocket communication to lila
 * See src/socket.ts for the interface with the application
 */
import { SocketSetup } from '../socket/interfaces'
import StrongSocket from './StrongSocket'

const pool: Map<string, StrongSocket> = new Map()

let current: StrongSocket | undefined

const ctx: Worker = self as any
ctx.onmessage = (msg: MessageEvent) => {
  switch (msg.data.topic) {
    case 'create':
      create(msg.data.payload)
      break
    case 'send':
      doSend(msg.data.payload)
      break
    case 'ask': {
      const event = msg.data.payload.listenTo
      if (current &&
        current.options.registeredEvents.indexOf(event) === -1) {
        current.options.registeredEvents.push(event)
      }
      doSend(msg.data.payload.msg)
      break
    }
    case 'connect':
      if (current) current.connect()
      break
    case 'disconnect':
      if (current) current.disconnect()
      break
    case 'delayedDisconnect':
      if (current) current.delayedDisconnect(msg.data.payload)
      break
    case 'cancelDelayedDisconnect':
      if (current) current.cancelDelayedDisconnect()
      break
    case 'destroy':
      if (current) {
        current.disconnect()
        current = undefined
      }
      break
    case 'setVersion':
      if (current) {
        current.setVersion(msg.data.payload)
      }
      break
    case 'averageLag':
      if (current) {
        ctx.postMessage({ topic: 'averageLag', payload: Math.round(current.averageLag) })
      }
      else ctx.postMessage({ topic: 'averageLag', payload: null })
      break
    case 'getVersion':
      if (current) ctx.postMessage({ topic: 'getVersion', payload: current.version })
      else ctx.postMessage({ topic: 'getVersion', payload: null })
      break
    case 'deploy':
      if (current) current.deploy()
      break
    default:
      throw new Error('socker worker message not supported: ' + msg.data.topic)
  }
}

function create(payload: SocketSetup) {
  // don't always recreate default socket on page change
  // we don't want to do it for other sockets bc/ we want to register other
  // handlers on create
  if (current && payload.opts.options.name === 'default' &&
    current.options.name === 'default'
  ) {
    return
  }

  if (current) {
    current.disconnect(() => {
      current = new StrongSocket(
        ctx,
        payload.clientId,
        payload.socketEndPoint,
        payload.url,
        payload.version,
        payload.opts
      )
    })
  } else {
    current = new StrongSocket(
      ctx,
      payload.clientId,
      payload.socketEndPoint,
      payload.url,
      payload.version,
      payload.opts
    )
  }
}

function doSend(socketMsg: [string, string, any, any]) {
  const [url, t, d, o] = socketMsg
  if (current && current.ws) {
    if (current.path === url || url === 'noCheck') {
      current.send(t, d, o)
    } else {
      // trying to send to the wrong URL? log it
      const wrong = {
        t: t,
        d: d,
        url: url
      }
      current.send('wrongHole', wrong)
      console.warn('[socket] wrongHole', wrong)
    }
  }
}
