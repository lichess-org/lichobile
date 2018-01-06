import { PuzzleOutcome, UserData as PuzzleUserData } from '../../lichess/interfaces/training'
import { OfflinePuzzle } from './interfaces'
import store from '../../storage'

export default {
  unsolvedPuzzles: store.prop<OfflinePuzzle[]>('training.unsolvedPuzzles', []),
  solvedPuzzles: store.prop<PuzzleOutcome[]>('training.solvedPuzzles', []),
  user: store.prop<PuzzleUserData | undefined>('training.user', undefined),
}
