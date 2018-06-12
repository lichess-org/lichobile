export interface ChatData {
  id: string
  lines: Array<ChatMsg>
  writeable: boolean
}

export interface ChatMsg {
  readonly u: string
  readonly c: Color
  readonly t: string
  readonly r?: boolean
  readonly d?: boolean
}
