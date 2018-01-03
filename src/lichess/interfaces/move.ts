import { GameStatus, Pockets } from './game'

export interface MoveRequest {
  readonly u: string
}

export interface DropRequest {
  readonly role: Role
  readonly pos: Key
}

export interface MoveOrDrop {
  readonly fen: string
  readonly threefold: boolean
  readonly check: boolean
  readonly ply: number
  readonly wDraw: boolean
  readonly bDraw: boolean
  readonly uci: string
  readonly san: string
  readonly dests: StringMap
  readonly status?: GameStatus
  readonly winner?: Color
  readonly crazyhouse?: {
    readonly pockets: Pockets
  }
  clock?: {
    readonly white: number
    readonly black: number
    readonly lag?: number
  }
  readonly promotion?: {
    readonly key: Key
    readonly pieceClass: Role
  }
  readonly enpassant?: {
    readonly key: Key
    readonly color: Color
  }
  readonly drops?: Array<string>
  readonly castle?: {
    readonly king: KeyPair
    readonly rook: KeyPair
    readonly color: Color
  }
}

export interface Move extends MoveOrDrop {
  isMove: boolean
}

export interface Drop extends MoveOrDrop {
  isDrop: boolean
  readonly role: Role
}

export interface AfterMoveMeta {
  readonly premove?: boolean
  readonly predrop?: boolean
}

export function isMove(o: MoveOrDrop): o is Move {
  return (<Move>o).isMove
}

export function isDrop(o: MoveOrDrop): o is Drop {
  return (<Drop>o).isDrop
}

export function isMoveRequest(r: MoveRequest | DropRequest): r is MoveRequest {
  return (<MoveRequest>r).u !== undefined
}

export function isDropRequest(r: MoveRequest | DropRequest): r is DropRequest {
  return (<DropRequest>r).role !== undefined
}
