import { UserGame } from '../../lichess/interfaces/user'
import { Paginator } from '../../lichess/interfaces'

export interface SearchQuery {
  [param: string]: string
}

export interface SearchResult {
  paginator?: Paginator<UserGameWithDate>
}

export interface UserGameWithDate extends UserGame {
  date?: string
}

export interface SearchStateSetting {
  query?: SearchQuery
  games?: Array<UserGameWithDate>
  result?: SearchResult
  scrollPos?: number
}
