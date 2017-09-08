export type Coord = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
export type File = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h'
export type Rank = Coord

export type Pos = [Coord, Coord]

export type Pieces = {[index: string]: Piece}

export type PiecesDiff = {[index: string]: Piece | null}

export interface SetConfig {
  orientation?: Color
  fen?: string
  lastMove?: KeyPair
  check?: Color | boolean
  turnColor?: Color
  movableColor?: Color
  dests?: DestsMap
}

// {white: {pawn: 3 queen: 1}, black: {bishop: 2}}
export interface MaterialDiff {
  white: { [k: string]: number }
  black: { [k: string]: number }
}

export interface DOM {
  board: HTMLElement // cg base element for the board
  elements: { [k: string]: HTMLElement } // other dom elements
  bounds: ClientRect
}

export interface MoveMetadata {
  premove: boolean
  ctrlKey?: boolean
  holdTime?: number
  captured?: Piece
  predrop?: boolean
}

export interface SetPremoveMetadata {
  ctrlKey?: boolean
}

export interface Exploding {
  stage: number
  keys: Key[]
}

export interface Drop {
  role: Role
  key: Key
}

export type OtbMode = 'facing' | 'flip'

export interface KeyedNode extends HTMLElement {
  cgKey: Key
}
export interface PieceNode extends KeyedNode {
  cgRole: Role
  cgColor: Color
  cgAnimating?: boolean
  cgCaptured?: boolean
  cgDragging?: boolean
}
export interface SquareNode extends KeyedNode { }

export interface PrevData {
  orientation: Color | null
  bounds: ClientRect | null
  turnColor: Color | null
  otbMode: OtbMode | null
}
