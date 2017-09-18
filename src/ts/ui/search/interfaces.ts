import { UserGameWithDate } from '../../lichess/interfaces/user'
import { Paginator } from '../../lichess/interfaces'

export interface SearchQuery {
  [param: string]: string
  'players.a': string
  'players.b': string
  'players.white': string
  'players.black': string
  'players.winner': string
  ratingMin: string
  ratingMax: string
  hasAi: string
  source: string
  perf: string
  turnsMin: string
  turnsMax: string
  durationMin: string
  durationMax: string
  'clock.initMin': string
  'clock.initMax': string
  'clock.incMin': string
  'clock.incMax': string
  status: string
  winnerColor: string
  dateMin: string
  dateMax: string
  'sort.field': string
  'sort.order': string
}

export interface SearchResult {
  paginator?: Paginator<UserGameWithDate>
}
