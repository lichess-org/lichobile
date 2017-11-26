import * as xhr from './xhr'
import settings from '../../settings'
import { PuzzleSyncData } from '../../lichess/interfaces/training'

export function syncPuzzles() {
  const unsolved = settings.training.unsolvedPuzzles
  console.log(unsolved())
  const puzzleDeficit = Math.max(settings.training.puzzleBufferLen - unsolved().length, 0)
  if (puzzleDeficit)
    xhr.newPuzzles(puzzleDeficit).then((syncData: PuzzleSyncData) => unsolved(unsolved().concat(syncData.puzzles)))
  if (settings.training.solvedPuzzles().length)
    xhr.solvePuzzles(settings.training.solvedPuzzles())
}

export function loadNextPuzzle() {
  const unsolved = settings.training.unsolvedPuzzles()
  if (unsolved.length > 0)
    return unsolved[0]
  else
    return null
}
