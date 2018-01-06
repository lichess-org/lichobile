import { Game, PuzzleData, PuzzleOutcome, UserData as PuzzleUserData } from '../../lichess/interfaces/training'
import { StoredProp } from '../../storage'
import { OfflinePuzzle } from './interfaces'

export interface Data extends PuzzleData {
  game: PimpedGame
  round?: any
}

export interface OfflinePuzzle extends PuzzleData {
  userRating?: number
}

export interface OfflinePuzzleDatabase {
  unsolvedPuzzles: StoredProp<OfflinePuzzle[]>,
  solvedPuzzles: StoredProp<PuzzleOutcome[]>,
  user: StoredProp<PuzzleUserData | undefined>,
}

export interface PimpedGame extends Game {
  variant: {
    key: VariantKey
  }
}

export type Mode = 'view' | 'play' | 'try'
export type Feedback = 'init' | 'fail' | 'retry' | 'win' | 'good'

export interface VM {
  loading: boolean
  initializing: boolean
  moveValidationPending: boolean
  mode: Mode
  lastFeedback: Feedback
  canViewSolution: boolean
  resultSent: boolean
}
