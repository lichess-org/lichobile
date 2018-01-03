import * as xhr from './xhr'
import { PuzzleSyncData, PuzzleData } from '../../lichess/interfaces/training'
import router from '../../router'
import settings from '../../settings'
import { OfflinePuzzle, OfflinePuzzleDatabase } from './interfaces'

export function syncPuzzles(database: OfflinePuzzleDatabase) {
  let unsolved = database.unsolvedPuzzles()
  const user = database.user()
  const curRating = user ? user.rating : null
  const discardedPuzzles: OfflinePuzzle[] = []
  // Cull puzzles that were retreived when the user's rating was significantly different than it is now
  if (curRating)
    unsolved = unsolved.reduce((acc: OfflinePuzzle[], cur: OfflinePuzzle) => {
      const ratingDiff = (curRating && cur.userRating) ? Math.abs(curRating - cur.userRating) : 0
      if (ratingDiff < settings.training.ratingDiffThreshold) {
        discardedPuzzles.push(cur)
        return acc.concat([cur])
      }
      return acc
    }, [])

  const puzzleDeficit = Math.max(settings.training.puzzleBufferLen - unsolved.length, 0)
  let puzzlesLoaded = Promise.resolve(true)
  if (puzzleDeficit) {
    puzzlesLoaded = xhr.newPuzzles(puzzleDeficit).then((syncData: PuzzleSyncData) => {
      unsolved = unsolved.concat(syncData.puzzles.map((puzzle: OfflinePuzzle) => {
        if (syncData.user)
          puzzle.userRating = syncData.user.rating
        return puzzle
      }))
      database.user(syncData.user)
      return true
    }).catch(() => {
      // If loading new puzzles fails, add back the discarded ones to avoid potentially running out of puzzles
      unsolved = unsolved.concat(discardedPuzzles)
      return false
    }).then((retVal: boolean) => {
      database.unsolvedPuzzles(unsolved)
      return retVal
    })
  }
  else {
    database.unsolvedPuzzles(unsolved)
  }

  const solved = database.solvedPuzzles()
  if (solved.length) {
    xhr.solvePuzzles(solved)
      .then(() => database.solvedPuzzles([]))
      .catch(() => { })
  }
  return puzzlesLoaded
}

export function loadOfflinePuzzle(database: OfflinePuzzleDatabase): Promise<PuzzleData> {
  const unsolved = database.unsolvedPuzzles()
  if (unsolved.length > 0)
    return Promise.resolve(unsolved[0])
  else
    return Promise.reject('No additional offline puzzles available. Go online to get another ${settings.training.puzzleBufferLen}')
}

export function puzzleLoadFailure (reason: string) {
  window.plugins.toast.show(reason, 'short', 'center')
  router.set('/')
}
