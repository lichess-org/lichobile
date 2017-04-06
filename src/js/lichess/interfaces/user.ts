import { GameSource, GameStatus, ClockData, Opening } from './game'

export type GameFilter = 'all' | 'rated' | 'win' | 'loss' | 'draw' | 'bookmark' | 'me' | 'import' | 'playing'

export interface UserGamesCount {
  all: number
  rated: number
  ai: number
  draw: number
  drawH: number
  loss: number
  lossH: number
  win: number
  winH: number
  bookmark: number
  playing: number
  import: number
  me: number
  [index: string]: number
}

export interface UserFullProfile extends User {
  nbFollowers: number
  nbFollowing: number
  playing: string
  url: string
  count: UserGamesCount
  blocking?: boolean
  followable?: boolean
  following?: boolean
  followsYou?: boolean
}

export interface Perf {
  rating: number
  progress: number
  rd: number
  prog: number
  games: number
}

export interface LightUser {
  id: string
  name: string
  title?: string
  patron: boolean
}

export interface BaseUser {
  id: string
  username: string
  online?: boolean
  patron?: boolean
  title?: string
}

export interface User extends BaseUser {
  engine: boolean
  name?: string
  language: string
  rating?: number
  createdAt: Timestamp
  seenAt: Timestamp
  perfs: Perfs
  playTime?: PlayTime
  profile?: any
  booster: boolean
}

interface PlayTime {
  total: number
  tv: number
}

export type Perfs = { [pk: string]: Perf }

export interface RankingUser extends BaseUser {
  perfs: Perfs
}

export type RankingKey = PerfKey | 'online'
export type Rankings = Record<RankingKey, Array<RankingUser>>

export interface UserGamePlayer {
  user?: LightUser
  userId: string
  name?: string
  aiLevel?: number
  rating?: number
  ratingDiff?: number
}

export interface UserGame {
  id: string
  rated: boolean
  variant: Variant
  speed: Speed
  perf: PerfKey
  timestamp: Timestamp
  turns: number
  status: GameStatus
  clock?: ClockData
  correspondence?: {
    daysPerTurn: number
  }
  source?: GameSource
  players: {
    white: UserGamePlayer
    black: UserGamePlayer
  }
  fen: string
  lastMove?: string
  opening?: Opening
  winner?: Color
  bookmarks: number
  bookmarked?: boolean
  analysed?: boolean
}

export interface UserGameWithDate extends UserGame {
  date?: string
}

export type GraphPoint = [number, number, number, number]

export interface VariantPerfStats {
  user: LightUser
  perf: any
  rank: number
  percentile: number
  stat: any
  graph: Array<GraphPoint>
}

export type Relation = boolean
export interface Related {
  online: boolean
  perfs: Perfs
  patron: boolean
  user: string
  followable: boolean
  relation: Relation
  title?: string
}
