import * as xhr from './xhr'
import settings from '../../settings'
import { PuzzleSyncData } from '../../lichess/interfaces/training'

export function syncPuzzles() {
  const unsolved = settings.training.unsolvedPuzzles
  const puzzleDeficit = Math.max(settings.training.puzzleBufferLen - unsolved().length, 0)
  console.log('solved puzzles')
  console.log(settings.training.solvedPuzzles())
  console.log('puzzle deficit ' + puzzleDeficit)
  let promises = []
  if (puzzleDeficit) {
    promises.push(xhr.newPuzzles(puzzleDeficit).then((syncData: PuzzleSyncData) => unsolved(unsolved().concat(syncData.puzzles))))
  }
  console.log('solved puzzles')
  console.log(settings.training.solvedPuzzles())
  console.log('unsolved puzzles')
  console.log(settings.training.unsolvedPuzzles())
  if (settings.training.solvedPuzzles().length) {
    promises.push(xhr.solvePuzzles(settings.training.solvedPuzzles()))
  }
  return Promise.all(promises)
}

export function loadNextPuzzle() {
  const unsolved = settings.training.unsolvedPuzzles()
  console.log('unsolved puzzles')
  console.log(unsolved)
  if (unsolved.length > 0)
    return unsolved[0]
  else
    return null
}
