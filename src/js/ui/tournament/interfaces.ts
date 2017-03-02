import { Tournament, TournamentLists, PlayerInfo } from '../../lichess/interfaces/tournament'

export interface TournamentListState {
  tournaments: Mithril.Stream<TournamentLists>
  currentTab: Mithril.Stream<string>
  startPositions: Array<BoardPositionCategory>
}

export interface PlayerInfoState {
  open: (playerId: string) => void
  close: (fromBB?: string) => void
  isOpen: () => boolean
  tournament: Mithril.Stream<Tournament>
  playerData: Mithril.Stream<PlayerInfo>
}

export interface FaqState {
  open: () => void
  close: (fromBB?: string) => void
  isOpen: () => boolean
  tournament: Mithril.Stream<Tournament>
}

export interface TournamentAttrs {
  id: string
}

export interface FeaturedGameUpdate {
  id: string
  fen: string
  lm: string
}

export interface TournamentState {
  tournament: Mithril.Stream<Tournament>
  hasJoined: Mithril.Stream<boolean>
  faqCtrl: FaqState
  playerInfoCtrl: PlayerInfoState
  join: (tid: string, password?: string) => void
  withdraw: (tid: string) => void
  reload: (tid: string, p: number) => void
  first: () => void
  prev: () => void
  next: () => void
  last: () => void
  me: () => void
  isLoading: Mithril.Stream<boolean>
  clockInterval: Mithril.Stream<number>
  notFound: Mithril.Stream<boolean>
}
