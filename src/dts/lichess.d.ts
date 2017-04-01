declare type Timestamp = number

declare type StringMap = {
  [i: string]: string
}

declare type SanChar = 'P' | 'N' | 'B' | 'R' | 'Q'

declare type Color = 'white' | 'black'

declare type VariantKey = 'standard' | 'chess960' | 'antichess' | 'fromPosition' | 'kingOfTheHill' | 'threeCheck' | 'atomic' | 'horde' | 'racingKings' | 'crazyhouse'

declare type Speed = 'bullet' | 'blitz' | 'classical' | 'correspondence' | 'unlimited'
declare type PerfKey = 'bullet' | 'blitz' | 'classical' | 'correspondence' | 'chess960' | 'antichess' | 'fromPosition' | 'kingOfTheHill' | 'threeCheck' | 'atomic' | 'horde' | 'racingKings' | 'crazyhouse' | 'puzzle'

declare type Role = 'king' | 'queen' | 'knight' | 'bishop' | 'rook' | 'pawn'

declare type Pos = 'a1' | 'b1' | 'c1' | 'd1' | 'e1' | 'f1' | 'g1' | 'h1' | 'a2' | 'b2' | 'c2' | 'd2' | 'e2' | 'f2' | 'g2' | 'h2' | 'a3' | 'b3' | 'c3' | 'd3' | 'e3' | 'f3' | 'g3' | 'h3' | 'a4' | 'b4' | 'c4' | 'd4' | 'e4' | 'f4' | 'g4' | 'h4' | 'a5' | 'b5' | 'c5' | 'd5' | 'e5' | 'f5' | 'g5' | 'h5' | 'a6' | 'b6' | 'c6' | 'd6' | 'e6' | 'f6' | 'g6' | 'h6' | 'a7' | 'b7' | 'c7' | 'd7' | 'e7' | 'f7' | 'g7' | 'h7' | 'a8' | 'b8' | 'c8' | 'd8' | 'e8' | 'f8' | 'g8' | 'h8'

declare type GameSource = 'lobby' | 'pool' | 'friend' | 'ai' | 'api' | 'tournament' | 'position' | 'import' | 'offline'

declare type MoveTuple = [Pos, Pos]

declare type DestsMap = {
  [index: string]: Array<Pos>
}

interface LichessOptions {
  apiEndPoint: string
  socketEndPoint: string
  mode: string
  version: string
  gaId: string
  gcmSenderId: string
  sentryDSN: string
}

interface Window {
  lichess: LichessOptions
  moment: any
  shouldRotateToOrientation: () => boolean
  handleOpenURL: (url: string) => void
  AppVersion: { version: string }
}

interface PongMessage {
  d: number
  r: number
}

interface PlayTime {
  total: number
  tv: number
}

interface Piece {
  role: Role
  color: Color
  promoted?: boolean
}

interface Drop {
  role: Role
  key: Pos
}

interface TournamentClock {
  limit: number
  increment: number
}

interface ClockData {
  black: number
  white: number
  emerg: number
  running: boolean
  initial: number
  increment: number
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

interface Opening {
  ply?: number
  eco: string
  name: string
  fen?: string
  wikiPath?: string
}

interface ChatMsg {
  u: string
  c: Color
  t: string
  r?: boolean
  d?: boolean
}

interface Variant {
  key: VariantKey
  name: string
  short: string
  title?: string
}

interface BoardBounds {
  top: number
  right: number
  bottom: number
  left: number
  width: number
  height: number
}
