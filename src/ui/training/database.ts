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
  solved: PuzzleOutcome[]
  unsolved: PuzzleData[]
}

type UserId = string
export type OfflineData = Map<UserId, UserOfflineData>

function fetch(userId: UserId): Promise<UserOfflineData | null> {
  return asyncStorage.getItem<OfflineData>('trainingOfflinePuzzles')
  .then(data => (data && data.get(userId)) || null)
}

function save(userId: UserId, userData: UserOfflineData): Promise<OfflineData> {
  return asyncStorage.getItem<OfflineData>('trainingOfflinePuzzles')
  .then(data => {
    const map: OfflineData = data || new Map()
    map.set(userId, userData)
    return asyncStorage.setItem('trainingOfflinePuzzles', map)
  })
}

