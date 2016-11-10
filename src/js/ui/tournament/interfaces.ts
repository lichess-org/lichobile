export interface TournamentCreateResponse {
  id: string
}

export interface Tournament {
  clock: TournamentClock
  createdBy: string
  featured: FeaturedGame
  fullName: string
  id: string
  isFinished: boolean
  isStarted: boolean
  minutes: number
  nbPlayers: number
  pairings: Array<TournamentPairing>
  pairingsClosed: boolean
  perf: Perf
  schedule: Schedule
  secondsToFinish: number
  socketVersion: number
  standing: Standing
  startsAt: string
  system: string
  variant: string
  verdicts: Verdicts
}

interface TournamentClock {
  increment: number
  limit: number
}

interface FeaturedGame {
  black: FeaturedColorPlayer
  clock: FeaturedClock
  color: string
  fen: string
  id: string
  lastMove: string
  opponent: FeaturedPlayer
  player: FeaturedPlayer
  white: FeaturedColorPlayer
}

interface FeaturedColorPlayer {
  name: string
  rank: number
  rating: number
  ratingDiff: number
}

interface FeaturedPlayer {
  rating: number
  user: FeaturedPlayerUser
}

interface FeaturedPlayerUser {
  username: string
}

interface FeaturedClock {
  increment: number
  initial: number
}

interface TournamentPairing {
  id: string
  s: number
  u: Array<string>
}

interface Perf {
  icon: string
  name: string
  position?: number
}

interface Schedule {
  freq: string
  speed: string
}

interface Standing {
  page: number
  players: Array<StandingPlayer>
}

interface StandingPlayer {
  name: string
  provisional: boolean
  rank: number
  rating: number
  ratingDiff: number
  score: number
  sheet: Sheet
}

interface Sheet {
  fire: boolean
  scores: Array<Array<number>>
  total: number
}

interface Verdicts {
  accepted: boolean
  list: Array<Verdict>
}

interface Verdict {
  condition: string
  verdict: string
}

export interface PlayerInfo {
  pairings: Array<PlayerInfoPairing>
  player: PlayerInfoPlayer
}

interface PlayerInfoPairing {
  berserk: true
  color: string
  id: string
  op: PlayerInfoOpponent
  score: number
  status: number
  win: boolean
}

interface PlayerInfoOpponent {
  name: string
  rating: number
}

interface PlayerInfoPlayer {
  fire: boolean
  id: string
  name: string
  nb: PlayerInfoNb
  performance: number
  rank: number
  rating: number
  ratingDiff: number
  score: number
}

interface PlayerInfoNb {
  berserk: number
  game: number
  win: number
}

export interface TournamentList {
  created: number
  finished: number
  started: number
}

interface TournamentListItem {
  clock: TournamentClock
  conditions: Conditions
  createdBy: string
  finishesAt: number
  fullName: string
  id: string
  minutes: number
  nbPlayers: number
  perf: Perf
  private: boolean
  rated: boolean
  schedule: Schedule
  secondsToStart: number
  startsAt: number
  status: number
  system: string
  variant: Variant
  winner: WinnerUser
}

interface Conditions {
  maxRating: string
  nbRatedGame: string
}

interface Variant {
  key: string
  name: string
  short: string
}

interface WinnerUser {
  id: string
  name: string
  title: string
}
