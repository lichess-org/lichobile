import { Plugins } from '@capacitor/core'
import router from '../../router'
import { Session } from '../../session'
import settings from '../../settings'
import { PuzzleData, PuzzleOutcome } from '../../lichess/interfaces/training'

import * as xhr from './xhr'
import { Database, UserOfflineData } from './database'

/*
 * Synchronize puzzles with server and load a new puzzle from offline database.
 */
export function syncAndLoadNewPuzzle(
  database: Database,
  user: Session
): Promise<PuzzleData> {
  // try loading first from DB to avoid any unnecessary loading time (spotty
  // connection)
  // if no puzzles available, sync and load
  return loadNewPuzzle(database, user)
  .catch(() => doLoadPuzzle(() => syncPuzzles(database, user)))
}

/*
 * Load a new puzzle from offline database.
 */
export function loadNewPuzzle(database: Database, user: Session): Promise<PuzzleData> {
  return doLoadPuzzle(() => database.fetch(user.id))
}

/*
 * Get remaining puzzles in unsolved queue
 */
export function getUnsolved(database: Database, user: Session): Promise<ReadonlyArray<PuzzleData>> {
  return database.fetch(user.id)
  .then(data => data && data.unsolved || [])
}

/*
 * Get the number of remaining puzzles in unsolved queue
 */
export function nbRemainingPuzzles(database: Database, user: Session): Promise<number> {
  return database.fetch(user.id)
  .then(data => data && data.unsolved.length || 0)
}

/*
 * Save puzzle result in database and synchronize with server.
 */
export function syncPuzzleResult(
  database: Database,
  user: Session,
  outcome: PuzzleOutcome
): Promise<UserOfflineData | null> {
  return database.fetch(user.id)
  .then(data => {
    // if we reach here there must be data
    if (data) {
      return database.save(user.id, {
        ...data,
        solved: data.solved.concat([{
          id: outcome.id,
          win: outcome.win
        }]),
        unsolved: data.unsolved.filter(p => p.puzzle.id !== outcome.id)
      })
      .then(() => {
        return syncPuzzles(database, user)
      })
    }

    return null
  })
}

/*
 * Sync current data then clear puzzle cache to force get new puzzles
 */
export function syncAndClearCache(database: Database, user: Session): Promise<PuzzleData> {
  return syncPuzzles(database, user)
  .then(() =>
    database.clean(user.id).then(() =>
      syncAndLoadNewPuzzle(database, user)
    )
  )
}

export function puzzleLoadFailure(reason: any) {
  if (typeof reason === 'string') {
    Plugins.LiToast.show({ text: reason, duration: 'long' })
  } else {
    Plugins.LiToast.show({ text: 'Could not load puzzle', duration: 'short' })
  }
  router.set('/')
}

/*
 * Synchronize puzzles with server.
 * The goal is to keep a queue of 50 (see settings) puzzles in the offline database,
 * so that they can be played offline at any time.
 *
 * Each time a puzzle is solved or a new puzzle is requested, this function is called.
 * It keeps track of solved puzzles and unsolved ones. Solved ones are synchronized
 * so that rating is up to date server side, and unsolved ones are downloaded
 * when needed, ie. when the queue length is less than 50.
 *
 * Returns a Promise with synchronized data or null if no data was already here
 * and synchronization could not be performed (when offline for instance).
 */
function syncPuzzles(database: Database, user: Session): Promise<UserOfflineData | null> {
  return database.fetch(user.id)
  .then(stored => {
    const unsolved = stored ? stored.unsolved : []
    const solved = stored ? stored.solved : []

    const puzzleDeficit = Math.max(
      settings.training.puzzleBufferLen - unsolved.length,
      0
    )

    const solvePromise =
      solved.length > 0 ? xhr.solvePuzzlesBatch(solved) : Promise.resolve()

    const allIds = unsolved.map(p => p.puzzle.id)
    const lastId = allIds.length > 0 ? Math.max(...allIds) : undefined

    return solvePromise
    .then(() => !stored || puzzleDeficit > 0 ?
      xhr.newPuzzlesBatch(puzzleDeficit, lastId) : Promise.resolve({
        puzzles: [],
        user: stored.user,
      })
    )
    .then(newData => {
      return database.save(user.id, {
        user: newData.user,
        unsolved: unsolved.concat(newData.puzzles),
        solved: []
      })
    })
    // when offline, sync cannot be done so we return same stored data
    .catch(() => stored)
  })
}

function doLoadPuzzle(fetchFn: () => Promise<UserOfflineData | null>): Promise<PuzzleData> {
  return new Promise((resolve, reject) => {
    fetchFn()
    .then(data => {
      if (data && data.unsolved.length > 0) {
        resolve(data.unsolved[0])
      }
      else {
        reject(`No additional offline puzzle available. Go online to get another ${settings.training.puzzleBufferLen}`)
      }
    })
    .catch(reject)
  })
}
