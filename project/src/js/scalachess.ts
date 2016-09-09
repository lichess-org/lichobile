
export interface MoveRequest {
  orig: Pos
  dest: Pos
  variant: VariantKey
  fen: string
  path?: string
  ply: number
  promotion?: string
  pgnMoves?: Pos[]
  uciMoves?: string[]
}
