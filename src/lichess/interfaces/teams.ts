export interface Team {
  readonly description: string
  readonly id: string
  readonly joined: boolean
  readonly leader: Leader
  readonly leaders: ReadonlyArray<Leader>
  readonly location: string
  readonly name: string
  readonly nbMembers: number
  readonly open: boolean
  readonly requested: boolean
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

export interface Leader {
  readonly id: string
  readonly name: string
  readonly patron?: boolean
  readonly title?: boolean
}
