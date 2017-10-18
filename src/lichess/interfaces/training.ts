export interface PuzzleData {
  puzzle: Puzzle
  mode: 'view' | 'play' | 'try'
  progress?: any
  attempt?: PuzzleAttempt
}

export interface PuzzleAttempt {
  win: boolean
  userRatingDiff: number
}

export interface Puzzle {
  id: number
  rating: number
  attempts: number
  fen: string
  color: Color
  initialMove: KeyPair
  initialPly: number
  gameId: string
  lines: Lines
  enabled: boolean
  vote: number
}

export type Lines = { [uci: string]: Lines | string }
