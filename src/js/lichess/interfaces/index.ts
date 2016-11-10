export interface LightPlayer {
}

export interface LobbyData {
  lobby: {
    version: number
  }
}

export interface HookData {
  hook: {
    id: string
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

