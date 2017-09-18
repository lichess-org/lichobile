import { GameStatus, Pockets } from './game'

export interface MoveRequest {
  u: string
}

export interface DropRequest {
  role: Role
  pos: Key
}

export interface MoveOrDrop {
  fen: string
  threefold: boolean
  check: boolean
  ply: number
  wDraw: boolean
  bDraw: boolean
  uci: string
  san: string
  dests: StringMap
  status?: GameStatus
  winner?: Color
  crazyhouse?: {
    pockets: Pockets
  }
  clock?: {
    white: number
    black: number
    lag?: number
  }
  promotion?: {
    key: Key
    pieceClass: Role
  }
  enpassant?: {
    key: Key
    color: Color
  }
  drops?: Array<string>
  castle?: {
    king: KeyPair
    rook: KeyPair
    color: Color
  }
}

export interface Move extends MoveOrDrop {
  isMove: boolean
}

export interface Drop extends MoveOrDrop {
  isDrop: boolean
  role: Role
}

export interface AfterMoveMeta {
  premove?: boolean
  predrop?: boolean
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
