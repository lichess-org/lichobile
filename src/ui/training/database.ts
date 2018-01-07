import asyncStorage from '../../asyncStorage'
import { PuzzleOutcome, PuzzleData, UserData } from '../../lichess/interfaces/training'

export interface OfflinePuzzle extends PuzzleData {
  userRating?: number
}

export interface UserOfflineData {
  user: UserData
  solved: PuzzleOutcome[]
  unsolved: OfflinePuzzle[]
}

type UserId = string
export type OfflineData = Map<UserId, UserOfflineData>

export interface Database {
  fetch(userId: UserId): Promise<UserOfflineData>
  save(userId: UserId, userData: UserOfflineData): Promise<OfflineData>
}

function fetch(userId: UserId): Promise<UserOfflineData> {
  return new Promise ((resolve, reject) => {
    asyncStorage.getItem<OfflineData>('trainingOfflinePuzzles')
    .then(data => {
      const userData = data && data.get(userId)
      if (userData) {
        resolve(userData)
      } else {
        reject(new Error(`No data found for user: ${userId}`))
      }
    })
  })
}

function save(userId: UserId, userData: UserOfflineData): Promise<OfflineData> {
  return asyncStorage.getItem<OfflineData>('trainingOfflinePuzzles')
  .then(data => {
    const map: OfflineData = data || new Map()
    map.set(userId, userData)
    return asyncStorage.setItem('trainingOfflinePuzzles', map)
  })
}

export default {
  fetch,
  save,
} as Database
