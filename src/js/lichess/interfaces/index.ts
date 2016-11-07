
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

