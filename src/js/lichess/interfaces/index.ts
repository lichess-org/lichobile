export interface Pool {
  id: string
  lim: number
  inc: number
  perf: string
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

export type ModeId = 0 | 1

export interface Seek {
  id: string
  username: string
  rating: number
  variant: Variant
  mode: ModeId
  days: number
  color: Color
  perf: {
    icon: string
    name: Perf
  }
}

export interface TimelineEntry {
  data: any;
  date: number;
  type: string;
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
  lastMove: string
  variant: Variant
  speed: Speed
  perf: Perf
  color: Color
  fen: string
  rated: boolean
  opponent: NowPlayingOpponent
  secondsLeft: number
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
