export type CastlingToggle = 'K' | 'Q' | 'k' | 'q'

export const CASTLING_TOGGLES: CastlingToggle[] = ['K', 'Q', 'k', 'q']

export type CastlingToggles = {
  [side in CastlingToggle]: boolean
}

export interface BoardPosition {
  name: string
  fen: string
  eco?: string
}

export interface BoardPositionCategory {
  name: string
  positions: BoardPosition[]
}

export interface OpeningPosition {
  eco?: string
  name: string
  fen: string
  epd?: string
}

export interface EditorOptions {
  orientation?: Color
  onChange?: (fen: string) => void
  inlineCastling?: boolean
}

export interface EditorState {
  fen: string
  legalFen: string | undefined
  playable: boolean
}

export type Redraw = () => void
