export type Coord = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
export type File = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h'
export type Rank = Coord

export type Pos = [Coord, Coord]

export type Pieces = {[index: string]: Piece}

export type PiecesDiff = {[index: string]: Piece | null}

export interface InitConfig {
  batchRAF: (callback: () => void) => void
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
  initBounds?: ClientRect
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
