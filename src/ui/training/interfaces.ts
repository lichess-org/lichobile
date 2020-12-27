import { Game, PuzzleData } from '../../lichess/interfaces/training'

export interface Data extends PuzzleData {
  game: PimpedGame
  round?: any
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
  // true: up, false: down, null: not voted
  voted: boolean | null
}
