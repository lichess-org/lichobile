import { User } from './user'

export interface Game {
  id: string
  fen: string
  initialFen: string
  variant: Variant;
  player: Color
  source: GameSource
  status: GameStatus
  winner?: Color
  threefold?: boolean
  speed?: Speed
  startedAtTurn?: number
  rated?: boolean
  turns?: number
  lastMove?: string
  perf?: PerfKey
  // FIXM
  check?: string | boolean
  tournamentId?: string
  createdAt?: Timestamp
  boosted?: boolean
  rematch?: string
  offline?: boolean
  importedBy?: string
  opening?: Opening
}

export interface OnlineGame extends Game {
  rated: boolean
  turns: number
  speed: Speed
  perf: PerfKey
  check?: string
  importedBy?: string
}

export interface OfflineGame extends Game {
  check?: boolean;
}

export interface Player {
  id: string
  color: Color
  rating?: number
  user?: User
  provisional?: boolean
  username?: string
  name?: string
  ai?: number
  onGame?: boolean
  isGone?: boolean
  offeringDraw?: boolean
  proposingTakeback?: boolean
  offeringRematch?: boolean
  spectator?: boolean
  berserk?: boolean
  version?: number
  checks?: number
  ratingDiff?: number
}

export interface OnlinePlayer extends Player {
  version: number
}

interface Tournament {
  id: string;
  berserkable: boolean;
  secondsToFinish: number;
  nbSecondsForFirstMove: number;
  ranks?: {
    white: string;
    black: string;
    [color: string]: string;
  }
}

export interface GameData {
  game: Game
  player: Player
  opponent: Player
  correspondence?: CorrespondenceClockData
  clock?: ClockData
  steps: Array<GameStep>
  tournament?: Tournament
  note?: string
  chat?: Array<ChatMsg>
  possibleMoves?: StringMap
  possibleDrops?: string | Array<string>
  userTV?: string
  tv?: string
  pref?: any
  bookmarked?: boolean
  takebackable?: boolean
}

export interface OnlineGameData extends GameData {
  player: OnlinePlayer
  game: OnlineGame
  takebackable: boolean
  watchers?: GameWatchers
  url: {
    round: string
    socket: string
  }
}

export interface GameCrowd {
  white: boolean;
  black: boolean;
  watchers: GameWatchers;
}

export interface GameWatchers {
  anons: number;
  nb: number;
  users: Array<string>;
}

export interface GameStatus {
  id: number;
  name: string;
}

export interface OfflineGameData extends GameData {
  game: OfflineGame;
}

export interface CheckCount {
  white: number
  black: number
  [color: string]: number
}

export interface Pocket {
  queen: number
  rook: number
  knight: number
  bishop: number
  pawn: number
  [role: string]: number
}

export type Pockets = [Pocket, Pocket]

export interface GameStep {
  ply: number
  fen: string
  san: string | null
  uci: string | null
  check: boolean
  checkCount?: CheckCount
  dests?: DestsMap
  drops?: Array<string>
  crazy?: {
    pockets: Pockets
  }
}
