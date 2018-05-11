import asyncStorage from '../../asyncStorage'
import { PuzzleOutcome, PuzzleData, UserData } from '../../lichess/interfaces/training'

const db = {
  fetch,
  save,
}

export default db

export type Database = typeof db

export interface UserOfflineData {
  user: UserData
  solved: ReadonlyArray<PuzzleOutcome>
  unsolved: ReadonlyArray<PuzzleData>
}

type UserId = string

function fetch(userId: UserId): Promise<UserOfflineData | null> {
  return asyncStorage.getItem<UserOfflineData>(`offlinePuzzles.${userId}`)
  .then(data => {
    if (!data) {
      // compat layer for old storage key
      // TODO remove in 2 versions (from 6.0.0)
      return asyncStorage.getItem<{ [key: string]: UserOfflineData }>('training.offlinePuzzles')
      .then(data => data && data[userId] || null)
    } else {
      return data
    }
  })
}

function save(userId: UserId, userData: UserOfflineData): Promise<UserOfflineData> {
  return asyncStorage.setItem(`offlinePuzzles.${userId}`, userData)
}
