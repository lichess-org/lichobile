import { GameData } from './game'
import { AnalyseData } from './analyse'

export interface Pool {
  id: string
  lim: number
  inc: number
  perf: string
}

export interface PoolMember {
  id: string
}

export interface LobbyData {
  lobby: {
    version: number
    pools: Array<Pool>
  }
}

export interface HookData {
  hook: {
    id: string
  }
}

export interface LightPlayer {
  name: string
  title?: string
  rating?: number
}

export type ModeId = 0 | 1 // casual | rated
export type TimeModeId = 0 | 1 | 2 // unlimited | realTime | correspondence

export interface SeekSetup {
  variant: number
  timeMode: TimeModeId
  days: number
  time: number
  increment: number
  color: Color | 'random'
}

export interface HumanSeekSetup extends SeekSetup {
  mode: ModeId
  ratingMin?: number
  ratingMax?: number
}

export interface AiSeekSetup extends SeekSetup {
  level: number
  fen?: string
}

export interface CorrespondenceSeek {
  id: string
  username: string
  rating: number
  variant: Variant
  mode: ModeId
  days: number
  color: Color
  perf: {
    icon: string
    name: PerfKey
  }
}

export interface PongMessage {
  d: number
  r: number
}

export interface TimelineEntry {
  data: any
  date: number
  type: string
}

export interface TimelineData {
  entries: Array<TimelineEntry>
}

export interface DailyPuzzle {
  id: string
  fen: string
  color: Color
}

export interface NowPlayingOpponent {
  username: string
  id?: string
  rating?: number
  ai?: number
}

export interface NowPlayingGame {
  gameId: string
  fullId: string
  isMyTurn: boolean
  lastMove?: string
  variant: Variant
  speed: Speed
  perf: PerfKey
  color: Color
  fen: string
  rated: boolean
  opponent: NowPlayingOpponent
  secondsLeft?: number
}

export interface MiniUserPlayer {
  showing: boolean
  data: any
}
export interface MiniUser {
  player: MiniUserPlayer
  opponent: MiniUserPlayer
  [index: string]: MiniUserPlayer
}

export interface MiniBoardGameObjPlayer {
  rating: number
  user: {
    username: string
  }
}

export interface MiniBoardGameObj {
  player: MiniBoardGameObjPlayer
  opponent: MiniBoardGameObjPlayer
  clock?: {
    initial: number
    increment: number
  }
  correspondence?: {
    daysPerTurn: number
  }
}

export interface Paginator<T> {
  currentPage: number
  maxPerPage: number
  currentPageResults: Array<T>
  nbResults: number
  previousPage: number
  nextPage: number
  nbPages: number
}

interface ApiVersion {
  version: number
  deprecatedAt: Timestamp
  unsupportedAt: Timestamp
}

export interface ApiStatus {
  api: {
    current: number
    olds: ApiVersion[]
  }
  // version is detected as buggy
  mustUpgrade?: boolean
}

export function isPoolMember(conf: PoolMember | SeekSetup): conf is PoolMember {
  return (conf as PoolMember).id !== undefined
}

export function isSeekSetup(conf: PoolMember | SeekSetup): conf is SeekSetup {
  return (conf as SeekSetup).timeMode !== undefined
}
export function isGameData(data: GameData | AnalyseData): data is GameData {
  return (data as GameData).steps !== undefined
}
