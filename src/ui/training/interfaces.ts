import { Game, PuzzleData, PuzzleOutcome, UserData as PuzzleUserData } from '../../lichess/interfaces/training'
import TrainingCtrl from './TrainingCtrl'
import { SettingsProp } from '../../settings'
import { OfflinePuzzle } from './interfaces'

export interface Data extends PuzzleData {
  game: PimpedGame
  round?: any
}

export interface OfflinePuzzle extends PuzzleData {
  userRating?: number
}

export interface OfflinePuzzleDatabase {
  unsolvedPuzzles: SettingsProp<OfflinePuzzle[]>,
  solvedPuzzles: SettingsProp<PuzzleOutcome[]>,
  user: SettingsProp<PuzzleUserData | undefined>,
  lastPuzzle: SettingsProp<PuzzleData | undefined>
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

