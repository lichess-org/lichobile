import { TournamentListItem } from '../../lichess/interfaces/tournament'

export interface HomeState {
  nbConnectedPlayers: Mithril.Stream<number>
  nbGamesInPlay: Mithril.Stream<number>
  dailyPuzzle: Mithril.Stream<any>
  featuredTournaments: Mithril.Stream<Array<TournamentListItem>>
  timeline: Mithril.Stream<Array<any>>
  init(): void
  onResume(): void
}

export interface FeaturedTournamentData {
  featured: TournamentListItem[]
}
