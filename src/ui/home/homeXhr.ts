import { fetchJSON } from '../../http'
import { DailyPuzzle } from '../../lichess/interfaces'
import { OnlineGameData } from '../../lichess/interfaces/game'
import { TournamentListItem } from '../../lichess/interfaces/tournament'

interface FeaturedTournamentData {
  featured: TournamentListItem[]
}

export function featured(feedback: boolean): Promise<OnlineGameData> {
  return fetchJSON('/tv', undefined, feedback)
}

export function dailyPuzzle(): Promise<{ puzzle: DailyPuzzle }> {
  return fetchJSON('/training/daily', undefined)
}

export function featuredTournaments(): Promise<FeaturedTournamentData> {
  return fetchJSON('/tournament/featured', undefined)
}
