import {BaseUser} from './user'

export interface Team {
  readonly description: string
  readonly id: string
  readonly leader: BaseUser
  readonly leaders: ReadonlyArray<BaseUser>
  readonly location: string
  readonly name: string
  readonly nbMembers: number
  readonly open: boolean
}

export interface TeamJoinLeaveResponse {
  readonly ok: string
}

export interface TeamResults {
  currentPage: number
  currentPageResults: ReadonlyArray<Team>
  maxPerPage: number
  nbPages: number
  nbResults: number
  nextPage?: number
  previousPage?: number
}