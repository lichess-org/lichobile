/*
 * Web Worker responsible for all websocket communication to lila
 * See src/socket.ts for the interface with the application
 */
import StrongSocket from './StrongSocket'

let socketInstance: StrongSocket | undefined

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
      if (socketInstance &&
        socketInstance.options.registeredEvents.indexOf(event) === -1) {
        socketInstance.options.registeredEvents.push(event)
      }
      doSend(msg.data.payload.msg)
      break
    }
    case 'connect':
      if (socketInstance) socketInstance.connect()
      break
    case 'disconnect':
      if (socketInstance) socketInstance.disconnect()
      break
    case 'delayedDisconnect':
      if (socketInstance) socketInstance.delayedDisconnect(msg.data.payload)
      break
    case 'cancelDelayedDisconnect':
      if (socketInstance) socketInstance.cancelDelayedDisconnect()
      break
    case 'destroy':
      if (socketInstance) {
        socketInstance.disconnect()
        socketInstance = undefined
      }
      break
    case 'setVersion':
      if (socketInstance) {
        socketInstance.setVersion(msg.data.payload)
      }
      break
    case 'averageLag':
      if (socketInstance) {
        ctx.postMessage({ topic: 'averageLag', payload: Math.round(socketInstance.averageLag) })
      }
      else ctx.postMessage({ topic: 'averageLag', payload: null })
      break
    case 'getVersion':
      if (socketInstance) ctx.postMessage({ topic: 'getVersion', payload: socketInstance.version })
      else ctx.postMessage({ topic: 'getVersion', payload: null })
      break
    case 'deploy':
      if (socketInstance) socketInstance.deploy()
      break
    default:
      throw new Error('socker worker message not supported: ' + msg.data.topic)
  }
}

function create(payload: any) {
  // don't always recreate default socket on page change
  // we don't want to do it for other sockets bc/ we want to register other
  // handlers on create
  if (socketInstance && payload.opts.options.name === 'default' &&
    socketInstance.options.name === 'default'
  ) {
    return
  }

  if (socketInstance) {
    socketInstance.disconnect(() => {
      socketInstance = new StrongSocket(
        ctx,
        payload.clientId,
        payload.socketEndPoint,
        payload.url,
        payload.version,
        payload.opts
      )
    })
  } else {
    socketInstance = new StrongSocket(
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
  if (socketInstance && socketInstance.ws) {
    if (socketInstance.path === url || url === 'noCheck') {
      socketInstance.send(t, d, o)
    } else {
      // trying to send to the wrong URL? log it
      const wrong = {
        t: t,
        d: d,
        url: url
      }
      socketInstance.send('wrongHole', wrong)
      console.warn('[socket] wrongHole', wrong)
    }
  }
}
