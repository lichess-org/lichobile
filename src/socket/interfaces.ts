import { Friend } from '../lichess/friends'

export interface LichessMessage<T> {
  t: string
  d?: T
}

export type LichessMessageAny = LichessMessage<unknown>

interface Options {
  name: string
  debug?: boolean
  pingDelay?: number
  sendOnOpen?: ReadonlyArray<LichessMessageAny>
  registeredEvents: string[]
  isAuth?: boolean
}

export interface SocketConfig {
  options: Options
  params?: StringMap
}

type MessageHandler<D, P extends LichessMessage<D>> = (data?: D, payload?: P) => void

type MessageHandlerGeneric = MessageHandler<any, any>

export interface SocketIFace {
  send: <D, O>(t: string, data?: D, opts?: O) => void
  ask: <R>(t: string, listenTo: string, data?: any, opts?: any) => Promise<R>
}

export interface MessageHandlers {
  [index: string]: MessageHandlerGeneric
}

export interface SocketHandlers {
  onOpen: () => void
  onError?: () => void
  events: MessageHandlers
}

export interface SocketSetup {
  clientId: string
  socketEndPoint: string
  url: string
  version?: number
  opts: SocketConfig
}

export interface ConnectionSetup {
  setup: SocketSetup
  handlers: SocketHandlers
}

export interface FollowingEntersPayload extends LichessMessage<Friend> {
  playing: boolean
  patron: boolean
}

export interface FollowingOnlinePayload extends LichessMessage<string[]> {
  playing: string[]
  patrons: string[]
}
