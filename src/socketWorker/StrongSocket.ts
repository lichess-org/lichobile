type TimeoutId = number
type Payload = any
type Version = number
interface MsgBase {
  t: string
  d?: Payload
}
interface MsgIn extends MsgBase {
  v?: Version
}
type MsgOut = MsgBase
interface MsgAck extends MsgOut {
  at: number
}
type Send = (t: string, d: Payload, o?: unknown) => void

interface Options {
  name: string
  idle: boolean
  pingMaxLag: number // time to wait for pong before reseting the connection
  pingDelay: number // time between pong and ping
  autoReconnectDelay: number
  sendOnOpen?: readonly MsgOut[]
  registeredEvents: string[]
  isAuth: boolean
  debug?: boolean
}
interface Params {
  sri: string
  mobile: number
  flag?: string
}
interface Settings {
  receive?: (t: string, d: Payload) => void
  events: {
    [tpe: string]: (d: Payload | null, msg: MsgIn) => unknown
  }
  params: Params
  options?: Partial<Options>
}

export default class StrongSocket {
  settings: Settings
  options: Options
  version: number | false
  ws: WebSocket | undefined
  pingSchedule?: TimeoutId
  connectSchedule?: TimeoutId
  delayedDisconnectTimeoutId?: TimeoutId
  ackable: Ackable = new Ackable((t, d, o) => this.send(t, d, o))
  lastPingTime: number = performance.now()
  pongCount = 0
  averageLag = 0
  autoReconnect = true
  nbConnects = 0

  static defaultOptions: Options = {
    name: 'unnamed',
    idle: false,
    pingMaxLag: 9000, // time to wait for pong before reseting the connection
    pingDelay: 2500, // time between pong and ping
    autoReconnectDelay: 3500,
    sendOnOpen: undefined, // message to send on socket open
    registeredEvents: [],
    isAuth: false,
  }
  static defaultParams: Params = {
    sri: 'overrideMe',
    mobile: 1
  }

  constructor(
    readonly ctx: Worker,
    clientId: string,
    readonly baseUrl: string,
    readonly path: string,
    version: number | false,
    settings: Partial<Settings>
  ) {
    this.version = version
    this.settings = {
      receive: settings.receive,
      events: settings.events || {},
      params: {
        ...StrongSocket.defaultParams,
        ...settings.params || {},
        sri: clientId,
      }
    }
    this.options = {
      ...StrongSocket.defaultOptions,
      ...settings.options || {}
    }
    this.debug('Debug is enabled')
    this.connect()
  }

  public connect = () => {
    this.destroy()
    this.autoReconnect = true
    const fullUrl = makeUrl(this.baseUrl + this.path, {
      ...this.settings.params,
      v: this.version === false ? undefined : this.version
    })
    this.debug('connection attempt to ' + fullUrl)
    try {
      const ws = this.ws = new WebSocket(fullUrl)
      ws.onerror = e => this.onError(e)
      ws.onclose = () => {
        this.debug('connection closed')
        this.ctx.postMessage({ topic: 'disconnected' })
        if (this.autoReconnect) {
          this.debug('Will autoreconnect in ' + this.options.autoReconnectDelay)
          this.scheduleConnect(this.options.autoReconnectDelay)
        }
      }
      ws.onopen = () => {
        this.debug('connected to ' + fullUrl)
        this.ctx.postMessage({ topic: 'onOpen' })
        if (this.options.sendOnOpen) {
          this.options.sendOnOpen.forEach(x => { this.send(x.t, x.d) })
        }
        this.onSuccess()
        this.pingNow()
        this.ackable.resend()
      }
      ws.onmessage = e => {
        if (e.data == 0) return this.pong()
        const m = JSON.parse(e.data)
        if (m.t === 'n') this.pong()
        this.handle(m)
      }
    } catch (e) {
      this.onError(e)
    }
    this.scheduleConnect(this.options.pingMaxLag)
  }

  public send(t: string, d: any, o: any = {}, noRetry = false): void {
    const msg: Partial<MsgOut> = { t }
    if (d !== undefined) {
      if (o.withLag) d.l = Math.round(this.averageLag)
      if (o.millis >= 0) d.s = Math.round(o.millis * 0.1).toString(36)
      if (o.blur) d.b = 1
      msg.d = d
    }
    if (o.ackable) {
      msg.d = msg.d || {} // can't ack message without data
      this.ackable.register(t, msg.d) // adds d.a, the ack ID we expect to get back
    }

    const message = JSON.stringify(msg)
    this.debug('send ' + message)
    try {
      this.ws!.send(message)
    } catch (e) {
      // maybe sent before socket opens,
      // try again a second later.
      if (!noRetry) setTimeout(() => this.send(t, msg.d, o, true), 1000)
    }
  }

  private scheduleConnect(delay: number) {
    // self.debug('schedule connect ' + delay)
    clearTimeout(this.pingSchedule)
    clearTimeout(this.connectSchedule)
    this.connectSchedule = setTimeout(() => {
      this.ctx.postMessage({ topic: 'disconnected' })
      this.connect()
    }, delay)
  }

  private schedulePing = (delay: number) => {
    clearTimeout(this.pingSchedule)
    this.pingSchedule = setTimeout(this.pingNow, delay)
  }

  private pingNow = () => {
    clearTimeout(this.pingSchedule)
    clearTimeout(this.connectSchedule)
    const pingData = (this.options.isAuth && this.pongCount % 8 == 2) ? JSON.stringify({
      t: 'p',
      l: Math.round(0.1 * this.averageLag)
    }) : 'null'
    try {
      this.ws!.send(pingData)
      this.lastPingTime = performance.now()
    } catch (e) {
      this.debug(e, true)
    }
    this.scheduleConnect(this.options.pingMaxLag)
  }

  computePingDelay = () => this.options.pingDelay + (this.options.idle ? 1000 : 0)

  private pong() {
    clearTimeout(this.connectSchedule)
    this.schedulePing(this.computePingDelay())
    const currentLag = Math.min(performance.now() - this.lastPingTime, 10000)
    this.pongCount++

    // Average first 4 pings, then switch to decaying average.
    const mix = this.pongCount > 4 ? 0.1 : 1 / this.pongCount
    this.averageLag += mix * (currentLag - this.averageLag)
    this.ctx.postMessage({ topic: 'pingInterval', payload: this.pingInterval()})
  }

  private handle(m: MsgIn) {
    if (m.v && this.version !== false) {
      if (m.v <= this.version) {
        this.debug('already has event ' + m.v)
        return
      }
      if (m.v > this.version + 1) {
        this.debug('event gap detected from ' + this.version + ' to ' + m.v)
      }
      this.version = m.v
    }
    switch (m.t || false) {
      case false:
        break
      case 'ack':
        this.ackable.onServerAck(m.d)
        break
      default:
        if (this.options.registeredEvents.indexOf(m.t) !== -1) {
          this.ctx.postMessage({ topic: 'handle', payload: m })
        }
    }
  }

  public setVersion(version: number): void {
    this.version = version
    this.connect()
  }

  private debug(msg: string, always = false): void {
    if ((always || this.options.debug)) {
      console.debug('[' + this.options.name + ' ' + this.settings.params.sri + '] ' + msg)
    }
  }

  public delayedDisconnect(delay: number): void {
    this.delayedDisconnectTimeoutId = setTimeout(() => {
      this.disconnect()
    }, delay)
  }

  public cancelDelayedDisconnect(): void {
    clearTimeout(this.delayedDisconnectTimeoutId)
    this.delayedDisconnectTimeoutId = undefined
  }

  public destroy = (): void => {
    clearTimeout(this.pingSchedule)
    clearTimeout(this.connectSchedule)
    this.disconnect()
    this.ws = undefined
  }

  public disconnect = (onDisconnected?: () => void): void => {
    const ws = this.ws
    if (ws) {
      // if all messages are not sent before closed just retry until so
      if (ws.readyState === WebSocket.OPEN && ws.bufferedAmount > 0) {
        this.debug('Queued messages are waiting to being sent, retrying to close...', true)
        setTimeout(() => this.disconnect(onDisconnected), 2)
      } else {
        this.debug('Disconnect', true)
        this.autoReconnect = false
        ws.onerror = ws.onclose = ws.onopen = ws.onmessage = () => { }
        ws.close()
        if (onDisconnected) setTimeout(onDisconnected, 0)
      }
    }
  }

  /**
   * When the server restarts, we don't want to overload it
   * with thousands of clients trying to reconnect as soon as possible.
   * Instead, we wait between 10 to 20 seconds before reconnecting.
   * The added random allows sampling reconnections nicely.
   */
  public deploy(): void {
    this.destroy()
    // we don't want to possibly reconnect in background, so make sure there
    // is no disconnect scheduled
    if (this.delayedDisconnectTimeoutId === null) {
      this.scheduleConnect(10 * 1000 + Math.random() * 10 * 1000)
    }
  }

  private onError = (e: Event) => {
    this.ctx.postMessage({ topic: 'onError' })
    this.ctx.postMessage({ topic: 'disconnected' })
    this.options.debug = true
    this.debug('error: ' + JSON.stringify(e))
    clearTimeout(this.pingSchedule)
  }

  private onSuccess = () => {
    this.nbConnects++
    this.ctx.postMessage({ topic: 'connected' })
  }

  private pingInterval() {
    return this.options.pingDelay + this.averageLag
  }
}

class Ackable {

  currentId = 1 // increment with each ackable message sent
  messages: MsgAck[] = []
  private _sign?: string

  constructor(readonly send: Send) {
    setInterval(this.resend, 1200)
  }

  sign = (s: string) => this._sign = s

  resend = () => {
    const resendCutoff = performance.now() - 2500
    this.messages.forEach(m => {
      if (m.at < resendCutoff) this.send(m.t, m.d, {sign: this._sign})
    })
  }

  register = (t: string, d: Payload) => {
    d.a = this.currentId++
    this.messages.push({
      t: t,
      d: d,
      at: performance.now()
    })
  }

  onServerAck = (id: number) => {
    this.messages = this.messages.filter(m => m.d.a !== id)
  }
}

function makeUrl(path: string, params: Record<string, string | number | boolean | undefined>) {
  const searchParams = new URLSearchParams()
  for (const k of Object.keys(params)) {
    if (params[k] !== undefined) searchParams.append(k, params[k] as string)
  }
  const query = searchParams.toString()
  return query ? `${path}?${query}` : path
}
