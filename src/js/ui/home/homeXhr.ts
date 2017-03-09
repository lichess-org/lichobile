import { fetchJSON } from '../../http'
import { DailyPuzzle } from '../../lichess/interfaces'
import { User } from '../../lichess/interfaces/user'
import { OnlineGameData } from '../../lichess/interfaces/game'

export function featured(feedback: boolean): Promise<OnlineGameData> {
  return fetchJSON('/tv', undefined, feedback)
}

export function dailyPuzzle(): Promise<{ puzzle: DailyPuzzle }> {
  return fetchJSON('/training/daily', undefined, true)
}

export function topPlayersOfTheWeek(): Promise<User[]> {
  return fetchJSON('/player/top/week', undefined, true)
}
