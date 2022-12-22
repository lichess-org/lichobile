import { GameData } from './game'
import { AnalyseData } from './analyse'
import { LightUser, MiniUser as MiniUserData } from './user'

export interface Streamer {
  url: string
  status: string
  user: LightUser
}

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
  readonly ratingRangeMin?: number
  readonly ratingRangeMax?: number
}

export interface AiSeekSetup extends SeekSetup {
  readonly level: number
  readonly fen?: string
}

export interface CorrespondenceSeek {
  readonly id: string
  readonly username: string
  readonly rating: number
  readonly variant: {
    readonly key: string
  }
  readonly mode: ModeId
  readonly days: number
  readonly color: Color | ''
  readonly provisional?: boolean
  readonly perf: {
    readonly key: PerfKey
  }
}

export interface PongMessage {
  readonly d: number
  readonly r: number
}

export type TimelineEntry =
  BlogPostTimelineEntry
  | FollowTimelineEntry
  | ForumPostTimelineEntry
  | GameEndTimelineEntry
  | TourJoinTimelineEntry
  | StudyCreateTimelineEntry
  | StudyLikeTimelineEntry
  | StreamStartTimelineEntry
  | UblogPostTimelineEntry
  | UblogLikeTimelineEntry

export type TimelineEntryType = 'follow' | 'game-end' | 'tour-join' | 'study-create' | 'study-like' | 'forum-post' | 'blog-post' | 'ublog-post' | 'ublog-post-like' | 'stream-start'

interface BaseTimelineEntry {
  readonly type: TimelineEntryType
  readonly date: number
  // added dynamically
  fromNow: string
}

export interface BlogPostTimelineEntry extends BaseTimelineEntry {
  readonly type: 'blog-post'
  readonly data: {
    readonly id: string
    readonly slug: string
    readonly title: string
  }
}

export interface FollowTimelineEntry extends BaseTimelineEntry {
  readonly type: 'follow'
  readonly data: {
    readonly u1: string
    readonly u2: string
  }
}

export interface ForumPostTimelineEntry extends BaseTimelineEntry {
  readonly type: 'forum-post'
  readonly data: {
    readonly postId: string
    readonly topicName: string
    readonly userId: string
  }
}

export interface GameEndTimelineEntry extends BaseTimelineEntry {
  readonly type: 'game-end'
  readonly data: {
    readonly perf: PerfKey
    readonly win?: string
    readonly opponent: string
    readonly playerId: string
  }
}

export interface StreamStartTimelineEntry extends BaseTimelineEntry {
  readonly type: 'stream-start'
  readonly data: {
    readonly date: number
    readonly id: string
    readonly name: string
  }
}

type StudyTimelineEntryData = {
  readonly studyId: string
  readonly studyName: string
  readonly userId: string
}

export interface StudyCreateTimelineEntry extends BaseTimelineEntry {
  readonly type: 'study-create'
  readonly data: StudyTimelineEntryData
}

export interface StudyLikeTimelineEntry extends BaseTimelineEntry {
  readonly type: 'study-like'
  readonly data: StudyTimelineEntryData
}

export interface TourJoinTimelineEntry extends BaseTimelineEntry {
  readonly type: 'tour-join'
  readonly data: {
    readonly userId: string
    readonly tourName: string
    readonly tourId: string
  }
}

export interface UblogPostTimelineEntry extends BaseTimelineEntry {
  readonly type: 'ublog-post'
  readonly data: {
    readonly userId: string
    readonly id: string
    readonly slug: string
    readonly title: string
  }
}

export interface UblogLikeTimelineEntry extends BaseTimelineEntry {
  readonly type: 'ublog-post-like'
  readonly data: {
    readonly id: string
    readonly title: string
    readonly userId: string
  }
}

export interface TimelineData {
  readonly entries: ReadonlyArray<TimelineEntry>
  readonly users: {[username: string]: LightUser}
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
  data: MiniUserData | null
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
  color: Color
  orientation: Color
  fen: string
  id: string
  lastMove?: string
  white: FeaturedPlayer
}

export interface FeaturedGame2 {
  black: FeaturedPlayer
  c?: { white: number, black: number }
  orientation: Color
  fen: string
  id: string
  lastMove?: string
  white: FeaturedPlayer
  finished?: boolean
  winner?: Color
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
