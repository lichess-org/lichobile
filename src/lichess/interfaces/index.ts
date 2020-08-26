import { GameData } from './game'
import { AnalyseData } from './analyse'

export interface Pool {
  readonly id: string
  readonly lim: number
  readonly inc: number
  readonly perf: string
}

export interface PoolMember {
  readonly id: string
}

export interface LobbyData {
  readonly lobby: {
    readonly version: number
    readonly pools: ReadonlyArray<Pool>
  }
}

export interface HookData {
  readonly hook: {
    readonly id: string
  }
}

export interface LightPlayer {
  readonly name: string
  readonly title?: string
  readonly rating?: number
}

export type ModeId = 0 | 1 // casual | rated
export type TimeModeId = 0 | 1 | 2 // unlimited | realTime | correspondence

export interface SeekSetup {
  readonly variant: number
  readonly timeMode: TimeModeId
  readonly days: number
  readonly time: number
  readonly increment: number
  readonly color: Color | 'random'
}

export interface HumanSeekSetup extends SeekSetup {
  readonly mode: ModeId
  readonly ratingMin?: number
  readonly ratingMax?: number
}

export interface AiSeekSetup extends SeekSetup {
  readonly level: number
  readonly fen?: string
}

export interface CorrespondenceSeek {
  readonly id: string
  readonly username: string
  readonly rating: number
  readonly variant: Variant
  readonly mode: ModeId
  readonly days: number
  readonly color: Color | ''
  readonly provisional?: boolean
  readonly perf: {
    readonly icon: string
    readonly name: PerfKey
  }
}

export interface PongMessage {
  readonly d: number
  readonly r: number
}

export type TimelineEntryType = 'follow' | 'game-end' | 'tour-join' | 'study-create' | 'study-like' | 'forum-post' | 'blog-post'

export interface TimelineEntry {
  readonly data: any
  readonly date: number
  // added dynamically
  fromNow: string
  readonly type: TimelineEntryType
}

export interface TimelineData {
  readonly entries: ReadonlyArray<TimelineEntry>
}

export interface DailyPuzzle {
  readonly id: string
  readonly fen: string
  readonly color: Color
}

export interface NowPlayingOpponent {
  readonly username: string
  readonly id?: string
  readonly rating?: number
  readonly ai?: number
}

export interface NowPlayingGame {
  readonly gameId: string
  readonly fullId: string
  readonly isMyTurn: boolean
  readonly lastMove?: string
  readonly variant: Variant
  readonly speed: Speed
  readonly perf: PerfKey
  readonly color: Color
  readonly fen: string
  readonly rated: boolean
  readonly opponent: NowPlayingOpponent
  readonly secondsLeft?: number
}

export interface MiniUserPlayer {
  showing: boolean
  data: any
}
export interface MiniUser {
  readonly player: MiniUserPlayer
  readonly opponent: MiniUserPlayer
  readonly [index: string]: MiniUserPlayer
}

export interface FeaturedGame {
  black: FeaturedPlayer
  clock?: FeaturedClock
  correspondence?: any // yolo
  orientation: Color
  fen: string
  id: string
  lastMove?: string
  white: FeaturedPlayer
}

export interface FeaturedPlayer {
  readonly name: string
  readonly rating: number
  readonly ratingDiff: number
  readonly rank?: number
  readonly berserk?: boolean
  readonly title?: string
}

interface FeaturedClock {
  readonly increment: number
  readonly initial: number
}

export interface Paginator<T> {
  readonly currentPage: number
  readonly maxPerPage: number
  readonly currentPageResults: Array<T>
  readonly nbResults: number
  readonly previousPage: number
  readonly nextPage: number
  readonly nbPages: number
}

interface ApiVersion {
  readonly version: number
  readonly deprecatedAt: Timestamp
  readonly unsupportedAt: Timestamp
}

export interface ApiStatus {
  readonly api: {
    readonly current: number
    readonly olds: ApiVersion[]
  }
  // version is detected as buggy
  readonly mustUpgrade?: boolean
}

export interface TempBan {
  readonly date: Timestamp
  readonly mins: number
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
