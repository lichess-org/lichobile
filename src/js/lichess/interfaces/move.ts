import { GameStatus, Pockets } from './game'

export interface MoveRequest {
  u: string
}

export interface DropRequest {
  role: Role
  pos: Pos
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
  }
  promotion?: {
    key: Pos
    pieceClass: Role
  }
  enpassant?: {
    key: Pos
    color: Color
  }
  drops?: Array<string>
  castle?: {
    king: [Pos, Pos]
    rook: [Pos, Pos]
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
