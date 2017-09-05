export type Coord = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
export type File = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h'
export type Rank = Coord

export type Pos = [Coord, Coord]

export type Pieces = {[index: string]: Piece}

export type PiecesDiff = {[index: string]: Piece | null}

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
