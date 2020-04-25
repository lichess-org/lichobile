export interface Team {
  readonly id: string
  readonly name: string
  readonly leader: TeamLeader
  readonly description: string
  readonly open: boolean
}

interface TeamLeader {
  readonly id: string
  readonly name: string
  readonly patron: boolean
  readonly title: string
}

export interface TeamJoinLeaveResponse {
  readonly ok: string
}