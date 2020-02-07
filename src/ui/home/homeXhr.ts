import { fetchJSON } from '../../http'
import { OnlineGameData } from '../../lichess/interfaces/game'
import { PuzzleData } from '../../lichess/interfaces/training'
import { TournamentListItem } from '../../lichess/interfaces/tournament'

interface FeaturedTournamentData {
  featured: TournamentListItem[]
}

export function featured(feedback: boolean): Promise<OnlineGameData> {
  return fetchJSON('/tv', undefined, feedback)
}

export function dailyPuzzle(): Promise<PuzzleData> {
  return fetchJSON('/training/daily', undefined)
}

export function featuredTournaments(): Promise<FeaturedTournamentData> {
  return fetchJSON('/tournament/featured', undefined)
}
