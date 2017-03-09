
export interface HomeState {
  nbConnectedPlayers: Mithril.Stream<number>
  nbGamesInPlay: Mithril.Stream<number>
  dailyPuzzle: Mithril.Stream<any>
  weekTopPlayers: Mithril.Stream<Array<any>>
  timeline: Mithril.Stream<Array<any>>
  init(): void
  onResume(): void
}

