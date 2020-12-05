import { User } from './user'
import { ChatMsg } from './chat'
import { ClockState } from '../../ui/shared/clock/interfaces'

export interface GameData {
  readonly game: Game
  readonly player: Player
  readonly opponent: Player
  readonly correspondence?: CorrespondenceClockData
  readonly clock?: ClockData
  readonly steps: Array<GameStep>
  readonly tournament?: Tournament
  note?: string
  readonly chat?: Array<ChatMsg>
  possibleMoves?: StringMap
  possibleDrops?: PossibleDrops
  userTV?: string
  tv?: string
  bookmarked?: boolean
  readonly takebackable?: boolean
}

export interface OnlinePref {
  animationDuration: number
  autoQueen: 1 | 2 | 3
  clockSound?: boolean
  clockTenths: 0 | 1 | 2
  confirmResign?: boolean
  enablePremove?: boolean
  moveEvent: 0 | 1 | 2
  replay: 0 | 1 | 2
  rookCastle?: boolean
  showCaptured?: boolean
  submitMove?: boolean
  highlight?: boolean
  destination?: boolean
}

export interface OnlineGameData extends GameData {
  readonly player: OnlinePlayer
  readonly game: OnlineGame
  readonly orientation: Color
  readonly pref: OnlinePref
  readonly takebackable: boolean
  watchers?: GameWatchers
  readonly url: {
    readonly round: string
    readonly socket: string
  }
  expiration?: Expiration
}
export function isOnlineGameData(d: GameData): d is OnlineGameData {
  return (<OnlineGameData>d).url !== undefined
}

export interface OfflineGameData extends GameData {
  readonly offlineClock?: ClockState
  readonly pref: {
    animationDuration: number
    centerPiece?: boolean
  }
}

export type GameSource = 'lobby' | 'pool' | 'friend' | 'ai' | 'api' | 'tournament' | 'position' | 'import' | 'offline'

export interface Expiration {
  idleMillis: number
  movedAt: number
  millisToMove: number
}

export interface Game {
  readonly id: string
  readonly variant: Variant
  readonly initialFen: string
  fen: string
  player: Color
  status: GameStatus
  readonly source: GameSource
  turns: number
  readonly startedAtTurn: number
  readonly opening?: Opening
  winner?: Color
  threefold?: boolean
  readonly speed?: Speed
  readonly rated?: boolean
  readonly lastMove?: string
  readonly perf?: PerfKey
  readonly tournamentId?: string
  readonly createdAt?: Timestamp
  boosted?: boolean
  rematch?: string
  importedBy?: string
  // only for analyse
  moveCentis?: number[]
  readonly division?: {
    readonly middle?: number | null
    readonly end?: number | null
  }
  // only in mobile app
  readonly offline?: boolean
}

export interface OnlineGame extends Game {
  readonly rated: boolean
  readonly speed: Speed
  readonly perf: PerfKey
  readonly importedBy?: string
}

export interface Player {
  readonly color: Color
  readonly id?: string | null
  readonly rating?: number
  readonly user?: User
  readonly provisional?: boolean
  readonly username?: string
  name?: string
  readonly ai?: number
  onGame?: boolean
  isGone?: boolean
  offeringDraw?: boolean
  proposingTakeback?: boolean
  offeringRematch?: boolean
  spectator?: boolean
  readonly berserk?: boolean
  readonly version?: number
  checks?: number
  ratingDiff?: number
  readonly blurs?: { nb: number, percent: number }
}

export interface OnlinePlayer extends Player {
  readonly version: number
}

interface Tournament {
  readonly id: string
  readonly berserkable?: boolean
  readonly secondsToFinish?: number
  readonly nbSecondsForFirstMove?: number
  readonly name: string
  readonly ranks?: {
    readonly white: string
    readonly black: string
    readonly [color: string]: string
  }
}

export type PossibleDrops = string | ReadonlyArray<string>

export interface CorrespondenceClockData {
  readonly barTime: number
  black: number
  readonly daysPerTurn: number
  readonly emerg: number
  readonly increment: number
  white: number
}

export interface ClockData {
  readonly running: boolean
  readonly initial: Seconds
  readonly increment: Seconds
  readonly white: Seconds
  readonly black: Seconds
  readonly emerg: Seconds
  readonly moretime: Seconds
}

export interface ApiEnd {
  readonly winner?: Color
  readonly status: GameStatus
  readonly ratingDiff?: {
    readonly white: number
    readonly black: number
  }
  readonly boosted: boolean
  readonly clock?: {
    readonly wc: number
    readonly bc: number
  }
}

export interface GameCrowd {
  readonly white: boolean
  readonly black: boolean
  readonly watchers: GameWatchers
}

export interface GameWatchers {
  readonly anons: number
  readonly nb: number
  readonly users: ReadonlyArray<string>
}

export interface GameStatus {
  readonly id: number
  readonly name: string
}

export interface CheckCount {
  readonly white: number
  readonly black: number
  readonly [color: string]: number
}

export interface Pocket {
  readonly queen: number
  readonly rook: number
  readonly knight: number
  readonly bishop: number
  readonly pawn: number
  readonly [role: string]: number
}

export type Pockets = [Pocket, Pocket]

export interface GameStep {
  readonly ply: number
  readonly fen: string
  readonly san: string | null
  readonly uci: string | null
  readonly check: boolean
  readonly checkCount?: CheckCount
  readonly dests?: DestsMap
  readonly drops?: ReadonlyArray<string>
  readonly crazy?: {
    readonly pockets: Pockets
  }
}

export interface Opening {
  readonly ply?: number
  readonly eco: string
  readonly name: string
  readonly fen?: string
  readonly wikiPath?: string
}
