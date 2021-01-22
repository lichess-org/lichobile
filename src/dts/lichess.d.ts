declare type Timestamp = number
declare type Seconds = number
declare type Centis = number
declare type Millis = number

declare type StringMap = {
  [i: string]: string | undefined
}

declare type SanChar = 'P' | 'N' | 'B' | 'R' | 'Q'

declare type Color = 'white' | 'black'

declare type ColorMap<T> = {
  [C in Color]: T | undefined
}

declare type VariantKey = 'standard' | 'chess960' | 'antichess' | 'fromPosition' | 'kingOfTheHill' | 'threeCheck' | 'atomic' | 'horde' | 'racingKings' | 'crazyhouse'

declare type Speed = 'ultraBullet' | 'bullet' | 'blitz' | 'rapid' | 'classical' | 'correspondence' | 'unlimited'
declare type PerfKey = Speed | 'chess960' | 'antichess' | 'kingOfTheHill' | 'threeCheck' | 'atomic' | 'horde' | 'racingKings' | 'crazyhouse' | 'puzzle'

declare type Role = 'king' | 'queen' | 'knight' | 'bishop' | 'rook' | 'pawn'

declare type Key = 'a0' | 'a1' | 'b1' | 'c1' | 'd1' | 'e1' | 'f1' | 'g1' | 'h1' | 'a2' | 'b2' | 'c2' | 'd2' | 'e2' | 'f2' | 'g2' | 'h2' | 'a3' | 'b3' | 'c3' | 'd3' | 'e3' | 'f3' | 'g3' | 'h3' | 'a4' | 'b4' | 'c4' | 'd4' | 'e4' | 'f4' | 'g4' | 'h4' | 'a5' | 'b5' | 'c5' | 'd5' | 'e5' | 'f5' | 'g5' | 'h5' | 'a6' | 'b6' | 'c6' | 'd6' | 'e6' | 'f6' | 'g6' | 'h6' | 'a7' | 'b7' | 'c7' | 'd7' | 'e7' | 'f7' | 'g7' | 'h7' | 'a8' | 'b8' | 'c8' | 'd8' | 'e8' | 'f8' | 'g8' | 'h8'

declare type KeyPair = [Key, Key]

declare type NumberPair = [number, number]

declare type BoardPos = {
  left: number
  bottom: number
}

declare type Uci = string
declare type San = string
declare type Fen = string
declare type Ply = number

declare type DestsMap = {
  [index: string]: readonly Key[] | undefined
}

interface BuildConfig {
  NNUE: boolean
}

interface LichessOptions {
  apiEndPoint: string
  socketEndPoint: string
  mode: string
  buildConfig: BuildConfig
}

type RequestIdleCallbackHandle = any
type RequestIdleCallbackOptions = {
  timeout: number
}
type RequestIdleCallbackDeadline = {
  readonly didTimeout: boolean
  timeRemaining: (() => number)
}

interface Window {
  lichess: LichessOptions
  Shepherd: TetherShepherd.ShepherdStatic
  AndroidFullScreen: {
    showSystemUI: () => void
    immersiveMode: () => void
  }
  deviceInfo: {
    platform: 'ios' | 'android' | 'electron' | 'web'
    uuid: string
    appVersion: string
    cpuCores: number
    stockfishMaxMemory: number
  }
  requestIdleCallback?: ((
    callback: ((deadline: RequestIdleCallbackDeadline) => void),
    opts?: RequestIdleCallbackOptions,
  ) => RequestIdleCallbackHandle)
  cancelIdleCallback?: ((handle: RequestIdleCallbackHandle) => void)
}

interface Piece {
  role: Role
  color: Color
  promoted?: boolean
}

interface BoardPosition {
  name: string
  fen: string
  eco?: string
}

interface BoardPositionCategory {
  name: string
  positions: Array<BoardPosition>
}

interface Variant {
  key: VariantKey
  name: string
  short: string
  title?: string
}
