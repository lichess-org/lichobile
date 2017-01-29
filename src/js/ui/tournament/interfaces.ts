export interface TournamentCreateResponse {
  id: string
}

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
  quote?: Quote
  schedule: Schedule
  secondsToStart?: number
  secondsToFinish?: number
  socketVersion: number
  standing: Standing
  startsAt: string
  system: string
  variant: string
  verdicts: Verdicts
  position?: Opening
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

interface Perf {
  icon: string
  name: string
  position?: number
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

interface Standing {
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
  accepted: string
}

export interface PlayerInfo {
  pairings: Array<PlayerInfoPairing>
  player: PlayerInfoPlayer
}

export interface PlayerInfoPairing {
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
  score: number | Array<number>
}

interface PlayerInfoNb {
  berserk: number
  game: number
  win: number
}

export interface TournamentLists {
  created: Array<TournamentListItem>
  finished: Array<TournamentListItem>
  started: Array<TournamentListItem>
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

export interface TournamentListAttrs {
  tab: string
}

interface PositionCategory {
  name: string
  positions: Array<Opening>
}

export interface TournamentListsState {
  tournaments: Mithril.Stream<TournamentLists>
  currentTab: Mithril.Stream<string>
  startPositions?: Array<PositionCategory>
}

export interface PlayerInfoState {
  open: (playerId: string) => void
  close: (fromBB?: string) => void
  isOpen: () => boolean
  tournament: Mithril.Stream<Tournament>
  playerData: Mithril.Stream<PlayerInfo>
}

export interface FaqState {
  open: () => void
  close: (fromBB?: string) => void
  isOpen: () => boolean
  tournament: Mithril.Stream<Tournament>
}

export interface TournamentAttrs {
  id: string
}

export interface FeaturedGameUpdate {
  id: string
  fen: string
  lm: string
}

export interface TournamentState {
  tournament: Mithril.Stream<Tournament>
  hasJoined: Mithril.Stream<boolean>
  faqCtrl: FaqState
  playerInfoCtrl: PlayerInfoState
  join: (tid: string) => void
  withdraw: (tid: string) => void
  reload: (tid: string, p: number) => void
  first: () => void
  prev: () => void
  next: () => void
  last: () => void
  me: () => void
  isLoading: Mithril.Stream<boolean>
  clockInterval: Mithril.Stream<number>
  notFound: Mithril.Stream<boolean>
}
