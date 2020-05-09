export interface Team {
  readonly description: string
  readonly id: string
  readonly leader: TeamLeader
  readonly leaders: ReadonlyArray<TeamLeader>
  readonly location: string
  readonly name: string
  readonly nbMembers: number
  readonly open: boolean
}

interface TeamLeader {
  readonly id: string
  readonly name: string
  readonly patron: boolean
  readonly title: string
}

export interface TeamDetail {

}

export interface TeamJoinLeaveResponse {
  readonly ok: string
}