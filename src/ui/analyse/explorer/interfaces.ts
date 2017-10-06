
export interface IExplorerCtrl {
  setStep(): void
  loading: Mithril.Stream<boolean>
  failing: Mithril.Stream<boolean>
  config: any
  withGames: boolean
  current: Mithril.Stream<ExplorerData>
  fetchMasterOpening: (fen: string) => Promise<ExplorerData>
}

export interface Move {
  white: number
  black: number
  draws: number
  averageRating: number
  dtz: number
  dtm: number
  wdl: number
  san: string
  uci: string
  zeroing: boolean
  checkmate: boolean
  stalemate: boolean
  insufficient_material: boolean
  variant_win: boolean
  variant_loss: boolean
}

export interface Player {
  rating: number
  name: string
}

export interface Game {
  id: string
  white: Player
  black: Player
  year: string
  winner: Color
}

export interface ExplorerData {
  opening?: boolean
  tablebase?: boolean
  moves: Array<Move>
  topGames?: Array<Game>
  recentGames?: Array<Game>
  fen?: string
  checkmate?: boolean
  stalemate?: boolean
  variant_win?: boolean
  variant_loss?: boolean
}

export interface TablebaseData extends ExplorerData {
  fen: string
  checkmate: boolean
  stalemate: boolean
  variant_win: boolean
  variant_loss: boolean
}

export function isTablebaseData(data: ExplorerData): data is TablebaseData {
  return !!data.tablebase
}
