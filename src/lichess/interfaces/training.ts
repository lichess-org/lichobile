export interface PuzzleData {
  puzzle: Puzzle
  mode: 'view' | 'play' | 'try'
  user?: UserData
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

export interface UserData {
  history: number[]
  recent: Array<[number, number, number]>
  rating: number
}

export type Lines = { [uci: string]: Lines | string }
