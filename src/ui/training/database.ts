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
type OfflineData = {
  [key: string]: UserOfflineData
}

function fetch(userId: UserId): Promise<UserOfflineData | null> {
  return asyncStorage.getItem<OfflineData>('trainingOfflinePuzzles')
  .then(data => {
    return data && data[userId] || null
  })
}

function save(userId: UserId, userData: UserOfflineData): Promise<OfflineData> {
  return asyncStorage.getItem<OfflineData>('trainingOfflinePuzzles')
  .then(data => {
    const map: OfflineData = data || {}
    map[userId] = userData
    return asyncStorage.setItem('trainingOfflinePuzzles', map)
  })
}
