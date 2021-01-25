import { GameSource, GameStatus, ClockData, Opening } from './game'

export type GameFilter = 'all' | 'rated' | 'win' | 'loss' | 'draw' | 'bookmark' | 'me' | 'import' | 'playing'

export interface UserGamesCount {
  readonly all: number
  readonly rated: number
  readonly ai: number
  readonly draw: number
  readonly drawH: number
  readonly loss: number
  readonly lossH: number
  readonly win: number
  readonly winH: number
  readonly bookmark: number
  readonly playing: number
  readonly import: number
  readonly me: number
  readonly [index: string]: number
}

export interface UserFullProfile extends User {
  readonly completionRate?: number
  readonly nbFollowers: number
  readonly nbFollowing: number
  readonly playing: string
  readonly count: UserGamesCount
  readonly blocking?: boolean
  readonly followable?: boolean
  readonly following?: boolean
  readonly followsYou?: boolean
  readonly url: string
}

export interface Perf {
  readonly rating: number
  readonly rd: number
  readonly prog: number
  readonly games: number
  readonly prov?: boolean
}

export interface LightUser {
  readonly id: string
  readonly name: string
  readonly title?: string
  readonly patron?: boolean
}

export interface BaseUser {
  readonly id: string
  readonly username: string
  online?: boolean
  readonly patron?: boolean
  readonly title?: string
}

export interface User extends BaseUser {
  readonly tosViolation?: boolean
  readonly name?: string
  readonly language: string
  readonly rating?: number
  readonly createdAt: Timestamp
  readonly seenAt: Timestamp
  readonly perfs: Perfs
  readonly playTime?: PlayTime
  readonly profile?: any
  readonly booster: boolean
}

export interface PlayTime {
  readonly total: number
  readonly tv: number
}

export type Perfs = {
  readonly [pk: string]: Perf
}

export interface RankingUser extends BaseUser {
  readonly perfs: Perfs
}

export type RankingKey = PerfKey | 'online'
export type Rankings = Record<RankingKey, ReadonlyArray<RankingUser>>

export interface UserGamePlayer {
  readonly id?: string
  readonly user?: LightUser
  readonly name?: string
  readonly aiLevel?: number
  readonly rating?: number
  readonly ratingDiff?: number
}

export interface UserGame {
  readonly id: string
  readonly rated: boolean
  readonly variant: Variant
  readonly speed: Speed
  readonly perf: PerfKey
  readonly timestamp: Timestamp
  readonly turns: number
  readonly status: GameStatus
  readonly clock?: ClockData
  readonly correspondence?: {
    readonly daysPerTurn: number
  }
  readonly source?: GameSource
  readonly players: {
    readonly white: UserGamePlayer
    readonly black: UserGamePlayer
  }
  readonly fen: string
  readonly lastMove?: string
  readonly opening?: Opening
  readonly winner?: Color
  readonly bookmarks: number
  readonly bookmarked?: boolean
  readonly analysed?: boolean
  readonly tournament?: {
    name: string
    id: string
  }
}

export interface UserGameWithDate extends UserGame {
  date?: string
}

export type GraphPoint = [number, number, number, number]

export interface PerfStats {
  readonly user: LightUser
  readonly perf: any
  readonly rank: number
  readonly percentile: number
  readonly stat: any
  readonly graph: ReadonlyArray<GraphPoint>
}

export type Relation = boolean

export interface Related {
  readonly online: boolean
  readonly perfs: Perfs
  readonly patron: boolean
  readonly user: string
  readonly followable: boolean
  relation: Relation
  readonly title?: string
}

export interface Score {
  readonly nbGames: number
  readonly users: {
    readonly [id: string]: number | undefined
  }
}

export interface MiniUser {
  crosstable: Score
  perfs: any
}
