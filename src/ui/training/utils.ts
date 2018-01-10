import * as xhr from './xhr'
import router from '../../router'
import { Session } from '../../session'
import settings from '../../settings'
import { PuzzleData } from '../../lichess/interfaces/training'
import { Database, OfflineData } from './database'

/*
 * Synchronize puzzles with server.
 * The goal is to keep a queue of 50 (see settings) puzzles in the offline database,
 * so that they can be played offline at any time.
 *
 * Each time a puzzle is solved or a new puzzle is requested, this function is called.
 * It keeps track of solved puzzles and unsolved ones. Solved ones are synchronized
 * so that rating is up to date server side, and unsolved ones are downloaded
 * when needed, ie. when the queue length is less than 50.
 */
export function syncPuzzles(database: Database, user: Session): Promise<OfflineData> {
  return database.fetch(user.id)
  .then(data => {
    const unsolved = data ? data.unsolved : []
    const solved = data ? data.solved : []

    const puzzleDeficit = Math.max(
      settings.training.puzzleBufferLen - unsolved.length,
      0
    )

    return Promise.all([
      (data === null || puzzleDeficit > 0) ? xhr.newPuzzles(puzzleDeficit) : Promise.resolve({
        puzzles: [],
        user: data.user,
      }),
      solved.length > 0 ? xhr.solvePuzzles(solved) : Promise.resolve(),
    ])
    .then(([newData, _]) => {
      return database.save(user.id, {
        user: newData.user,
        unsolved: unsolved.concat(newData.puzzles),
        solved: []
      })
    })
  })
}

/*
 * Synchronize puzzles with server and load a new puzzle from offline database.
 *
 */
export function syncAndLoadNewPuzzle(database: Database, user: Session): Promise<PuzzleData> {
  return new Promise((resolve, reject) => {
    syncPuzzles(database, user)
    .then(() => {
      database.fetch(user.id)
      .then(data => {
        if (data && data.unsolved.length > 0) {
          resolve(data.unsolved[0])
        }
        else {
          reject(`No additional offline puzzles available. Go online to get another ${settings.training.puzzleBufferLen}`)
        }
      })
      .catch(reject)
    })
    .catch(reject)
  })
}

export function puzzleLoadFailure(reason: string) {
  window.plugins.toast.show(reason, 'short', 'center')
  router.set('/')
}

// TODO maybe enable later, let's keep it simple for now
// interface PruningOutcome {
//   pruned: OfflinePuzzle[]
//   discarded: OfflinePuzzle[]
// }
// Cull puzzles that were retreived when the user's rating was significantly
// different than it is now
// function pruneOffRated(puzzles: OfflinePuzzle[], user: UserData): PruningOutcome {
//   const rating = user.rating

//   return puzzles.reduce((acc: PruningOutcome, cur: OfflinePuzzle) => {
//     const ratingDiff = cur.userRating ? Math.abs(rating - cur.userRating) : 0
//     if (ratingDiff < settings.training.ratingDiffThreshold) {
//       return {
//         ...acc,
//         discarded: acc.discarded.concat([cur])
//       }
//     }
//     else {
//       return {
//         ...acc,
//         pruned: acc.pruned.concat([cur])
//       }
//     }
//   }, { pruned: [], discarded: [] })
// }
