import { Opening } from './game'

export interface Tournament {
  clock: TournamentClock
  createdBy: string
  featured?: FeaturedGame
  fullName: string
  id: string
  isFinished: boolean
  isRecentlyFinished?: boolean
  isStarted: boolean
  me?: TournamentMe
  minutes: number
  nbPlayers: number
  pairings: Array<TournamentPairing>
  pairingsClosed: boolean
  perf: Perf
  podium?: Array<PodiumPlace>
  private: boolean
  quote?: Quote
  schedule: Schedule
  secondsToStart?: number
  secondsToFinish?: number
  socketVersion: number
  standing: StandingPage
  startsAt: string
  system: string
  variant: string
  verdicts: Verdicts
  position?: Opening
}

interface Perf {
  icon: string
  name: string
  position?: number
}

export interface TournamentClock {
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

interface TournamentMe {
  rank: number
  username: string
  withdraw: boolean
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

export interface PodiumPlace {
  name: string
  nb: PlayerInfoNb
  performance: number
  rank: number
  rating: number
  ratingDiff: number
  score: number
}

interface Quote {
  author: string
  text: string
}

interface Schedule {
  freq: string
  speed: string
}

export interface StandingPage {
  page: number
  players: Array<StandingPlayer>
}

export interface StandingPlayer {
  name: string
  provisional: boolean
  rank: number
  rating: number
  ratingDiff: number
  score: number
  sheet: Sheet
  withdraw?: boolean
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

export interface PlayerInfoPairing {
  berserk: boolean
  color: Color
  id: string
  op: PlayerInfoOpponent
  score: [number, number] | number | null
  status: number
  win: boolean | null
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
  score: number | Array<number>
}

interface PlayerInfoNb {
  berserk: number
  game: number
  win: number
}

export interface TournamentLists {
  started: TournamentListItem[]
  created: TournamentListItem[]
  finished: TournamentListItem[]
  [i: string]: TournamentListItem[]
}

export interface TournamentListItem {
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
  schedule?: Schedule
  secondsToStart: number
  startsAt: number
  status: number
  system: string
  variant: Variant
  winner: WinnerUser
}

interface WinnerUser {
  id: string
  name: string
  title: string
}

interface Conditions {
  maxRating: string
  nbRatedGame: string
}

export interface TournamentCreateResponse {
  id: string
}
