export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
export type File = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h'
export type Key = 'a0' | 'a1' | 'b1' | 'c1' | 'd1' | 'e1' | 'f1' | 'g1' | 'h1' | 'a2' | 'b2' | 'c2' | 'd2' | 'e2' | 'f2' | 'g2' | 'h2' | 'a3' | 'b3' | 'c3' | 'd3' | 'e3' | 'f3' | 'g3' | 'h3' | 'a4' | 'b4' | 'c4' | 'd4' | 'e4' | 'f4' | 'g4' | 'h4' | 'a5' | 'b5' | 'c5' | 'd5' | 'e5' | 'f5' | 'g5' | 'h5' | 'a6' | 'b6' | 'c6' | 'd6' | 'e6' | 'f6' | 'g6' | 'h6' | 'a7' | 'b7' | 'c7' | 'd7' | 'e7' | 'f7' | 'g7' | 'h7' | 'a8' | 'b8' | 'c8' | 'd8' | 'e8' | 'f8' | 'g8' | 'h8'

export type Pos = [Rank, Rank]

export type Pieces = Map<Key, Piece>
export type PiecesDiff = Map<Key, Piece | null>

export interface InitConfig {
  fen?: string
  orientation?: Color
  turnColor?: Color
  check?: Color | boolean
  lastMove?: KeyPair | null
  selected?: Key
  coordinates?: boolean
  symmetricCoordinates?: boolean
  autoCastle?: boolean
  viewOnly?: boolean
  fixed?: boolean
  otb?: boolean
  otbMode?: OtbMode
  highlight?: {
    lastMove?: boolean
    check?: boolean
  }
  animation?: {
    enabled?: boolean
    duration?: number
  }
  movable?: {
    free?: boolean
    color?: Color | 'both' | null
    dests?: DestsMap | null
    showDests?: boolean
    rookCastle?: boolean
    events?: {
      after?: (orig: Key, dest: Key, metadata: MoveMetadata) => void
      afterNewPiece?: (role: Role, key: Key, metadata: MoveMetadata) => void
    }
  }
  premovable?: {
    enabled?: boolean
    showDests?: boolean
    castle?: boolean
    dests?: Key[]
    events?: {
      set?: (orig: Key, dest: Key, metadata?: SetPremoveMetadata) => void
      unset?: () => void
    }
  }
  predroppable?: {
    enabled?: boolean
    events?: {
      set?: (role: Role, key: Key) => void
      unset?: () => void
    }
  }
  draggable?: {
    enabled?: boolean
    distance?: number
    centerPiece?: boolean
    preventDefault?: boolean
    magnified?: boolean
    showGhost?: boolean
    deleteOnDropOff?: boolean
  }
  selectable?: {
    enabled: boolean
  }
  events?: {
    change?: () => void
    move?: (orig: Key, dest: Key, capturedPiece?: Piece) => void
    dropNewPiece?: (piece: Piece, key: Key) => void
  }
}

export interface SetConfig {
  orientation?: Color
  fen?: string
  lastMove?: KeyPair | null
  check?: Color | boolean
  turnColor?: Color
  movableColor?: Color | 'both' | null
  dests?: DestsMap | null
}

// {white: {pieces: {pawn: 3 queen: 1}, score: 6}, black: {pieces: {bishop: 2}, score: -6}
export interface MaterialDiff {
  white: { pieces: { [k: string]: number }, score: number }
  black: { pieces: { [k: string]: number }, score: number }
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
  keys: readonly Key[]
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
  cgColor: Color
  // role + color
  cgPiece: string
  cgAnimating?: boolean
  cgCaptured?: boolean
  cgDragging?: boolean
}
export type SquareNode = KeyedNode

export interface PrevData {
  orientation: Color | null
  bounds: ClientRect | null
  turnColor: Color | null
  otbMode: OtbMode | null
}
