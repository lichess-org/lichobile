import { UserGame } from '../../lichess/interfaces/user'
import { Paginator } from '../../lichess/interfaces'

export interface SearchSelect {
  name: string
  options: SearchOption[]
  default: string | null
  onchange?: () => void
}

export interface SearchOption {
  value: string
  label: string
}

export interface SearchQuery {
  [param: string]: string
}

export interface SearchResult {
  paginator: Paginator<UserGameWithDate>
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
