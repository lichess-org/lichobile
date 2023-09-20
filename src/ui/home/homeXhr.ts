import { fetchCachedJSON, fetchJSON } from '../../http'
import { Streamer } from '../../lichess/interfaces'
import { PuzzleData } from '../../lichess/interfaces/training'
import { TournamentListItem } from '../../lichess/interfaces/tournament'

interface FeaturedTournamentData {
  featured: TournamentListItem[]
}

export function featuredStreamers(): Promise<readonly Streamer[]> {
  return fetchCachedJSON(
    'streamer/featured',
    15,
    '/api/streamer/featured',
  )
}

export function dailyPuzzle(): Promise<PuzzleData> {
  return fetchJSON('/training/daily', undefined)
}

export function featuredTournaments(): Promise<FeaturedTournamentData> {
  return fetchJSON('/tournament/featured', undefined)
}
