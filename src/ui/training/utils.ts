import * as xhr from './xhr'
import { PuzzleSyncData, PuzzleData } from '../../lichess/interfaces/training'
import router from '../../router'
import settings from '../../settings'

export function syncPuzzles() {
  const unsolved = settings.training.unsolvedPuzzles
  const puzzleDeficit = Math.max(settings.training.puzzleBufferLen - unsolved().length, 0)
  console.log('solved puzzles')
  console.log(settings.training.solvedPuzzles())
  console.log('puzzle deficit ' + puzzleDeficit)
  let puzzlesLoaded = Promise.resolve(true)
  if (puzzleDeficit) {
    puzzlesLoaded = xhr.newPuzzles(puzzleDeficit).then((syncData: PuzzleSyncData) => unsolved(unsolved().concat(syncData.puzzles))).then(() => true, () => false)
  }
  console.log('solved puzzles')
  console.log(settings.training.solvedPuzzles())
  console.log('unsolved puzzles')
  console.log(settings.training.unsolvedPuzzles())
  if (settings.training.solvedPuzzles().length) {
    xhr.solvePuzzles(settings.training.solvedPuzzles()).then(() => settings.training.solvedPuzzles([]))
  }
  return puzzlesLoaded
}

function loadNextPuzzle() {
  const unsolved = settings.training.unsolvedPuzzles()
  console.log('unsolved puzzles')
  console.log(unsolved)
  if (unsolved.length > 0)
    return unsolved[0]
  else
    return null
}

export function loadOfflinePuzzle(onSuccess: (p: PuzzleData) => void, onFailure: () => void) {
  const cfg = loadNextPuzzle()
  if (cfg !== null) {
    onSuccess(cfg)
  }
  else {
    onFailure()
  }
}

export function puzzleLoadFailure () {
  window.plugins.toast.show(`No puzzles available. Go online to get another ${settings.training.puzzleBufferLen}`, 'short', 'center')
  router.set('/')
}
