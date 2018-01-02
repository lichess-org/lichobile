import { PuzzleData, Game } from '../../lichess/interfaces/training'
import TrainingCtrl from './TrainingCtrl'

export interface Data extends PuzzleData {
  game: PimpedGame
  round?: any
}

export interface OfflinePuzzle extends PuzzleData {
  userRating?: number
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

export interface State {
  ctrl?: TrainingCtrl
}
