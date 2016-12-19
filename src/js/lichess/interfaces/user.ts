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

export interface LightUser {
  id: string
  name: string
  title?: string
  patron: boolean
}

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
  perf: Perf
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
