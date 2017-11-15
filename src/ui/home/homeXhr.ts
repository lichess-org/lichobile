import { fetchJSON } from '../../http'
import { DailyPuzzle } from '../../lichess/interfaces'
import { OnlineGameData } from '../../lichess/interfaces/game'
import { FeaturedTournamentData } from './interfaces'

export function featured(feedback: boolean): Promise<OnlineGameData> {
  return fetchJSON('/tv', undefined, feedback)
}

export function dailyPuzzle(): Promise<{ puzzle: DailyPuzzle }> {
  return fetchJSON('/training/daily', undefined, true)
}

export function featuredTournaments(): Promise<FeaturedTournamentData> {
  return fetchJSON('/tournament/featured', undefined, false)
}
