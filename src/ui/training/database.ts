import asyncStorage from '../../asyncStorage'
import { PuzzleOutcome, PuzzleData, UserData } from '../../lichess/interfaces/training'

const db = {
  fetch,
  save,
  clean,
}

export default db

export type Database = typeof db

export interface UserOfflineData {
  user: UserData
  solved: ReadonlyArray<PuzzleOutcome>
  unsolved: ReadonlyArray<PuzzleData>
}

type UserId = string

const dbName = 'offlinePuzzlesV2'

function fetch(userId: UserId): Promise<UserOfflineData | null> {
  return asyncStorage.get<UserOfflineData>(`${dbName}.${userId}`)
}

function save(userId: UserId, userData: UserOfflineData): Promise<UserOfflineData> {
  return asyncStorage.set(`${dbName}.${userId}`, userData)
}

function clean(userId: UserId) {
  return asyncStorage.remove(`${dbName}.${userId}`)
}
