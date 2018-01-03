import { PuzzleData, PuzzleOutcome, UserData as PuzzleUserData } from '../../lichess/interfaces/training'
import { OfflinePuzzle } from './interfaces'
import { localstorageprop } from '../../settings'

export default {
  unsolvedPuzzles: localstorageprop<OfflinePuzzle[]>('training.unsolvedPuzzles', []),
  solvedPuzzles: localstorageprop<PuzzleOutcome[]>('training.solvedPuzzles', []),
  user: localstorageprop<PuzzleUserData | undefined>('training.user', undefined),
  lastPuzzle: localstorageprop<PuzzleData | undefined>('training.lastPuzzle', undefined)
}