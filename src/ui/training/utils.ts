import * as xhr from './xhr'
import router from '../../router'
import { Session } from '../../session'
import settings from '../../settings'
import { OfflinePuzzle, Database, OfflineData } from './database'

export function syncPuzzles(database: Database, user: Session): Promise<OfflineData> {
  return database.fetch(user.id)
  .then(data => {
    const puzzleDeficit = Math.max(
      settings.training.puzzleBufferLen - data.unsolved.length,
      0
    )

    return Promise.all([
      puzzleDeficit > 0 ? xhr.newPuzzles(puzzleDeficit) : Promise.resolve({
        puzzles: [],
        user: data.user,
      }),
      data.solved.length > 0 ? xhr.solvePuzzles(data.solved) : Promise.resolve(),
    ])
    .then(([newData, _]) => {
      return database.save(user.id, {
        user: newData.user,
        unsolved: data.unsolved.concat(newData.puzzles),
        solved: []
      })
    })
  })
}

export function loadOfflinePuzzle(database: Database, user: Session): Promise<OfflinePuzzle> {
  return new Promise((resolve, reject) => {
    database.fetch(user.id)
    .then(data => {
      if (data.unsolved.length > 0) resolve(data.unsolved[0])
      else reject(`No additional offline puzzles available. Go online to get another ${settings.training.puzzleBufferLen}`)
    })
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
