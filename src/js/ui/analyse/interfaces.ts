import * as cg from '../../chessground/interfaces'
import { GameData } from '../../lichess/interfaces/game'
import { Tree } from '../../utils/tree'
import AnalyseCtrl from './AnalyseCtrl'

export interface AnalysisData extends GameData {
  userAnalysis: boolean
  analysis?: RemoteAnalysis
  treeParts: Tree.Node[]
}

export interface AnalyseDataWithTree extends AnalysisData {
  tree: Tree.Node
}

export interface RoleToSan {
  [role: string]: SanChar
}

export interface SanToRole {
  [san: string]: Role
}

export type Source = 'online' | 'offline'

export interface EvalJugdment {
  comment: string
  glyph: Glyph
  name: string
}

export interface RemoteAnalysisMove {
  eval: number
  best?: string
  mate?: number
  variation?: string
  judgment?: EvalJugdment
}

export interface RemoteEval {
  cp: number
  best?: string
  mate?: number
  variation?: string
  judgment?: EvalJugdment
}

interface PlayerEvalSummary {
  acpl: number
  blunder: number
  inaccuracy: number
  mistake: number
  [i: string]: number
}

export interface RemoteEvalSummary {
  white: PlayerEvalSummary
  black: PlayerEvalSummary
}

export interface RemoteAnalysis {
  moves: Array<RemoteAnalysisMove>
  summary: RemoteEvalSummary
}

export interface Glyph {
  symbol: string
  name: string
}

export interface CevalWork {
  initialFen: string
  currentFen: string
  moves: string
  path: Tree.Path
  steps: Tree.Node[]
  ply: number
  emit: (res: CevalEmit) => void
}

export interface CevalEmit {
  work: CevalWork
  ceval: Tree.ClientEval
}

export interface CevalCtrlInterface {
  init(): Promise<void>
  isInit(): boolean
  start(path: Tree.Path, steps: Tree.Node[]): void
  stop(): void
  destroy(): void
  allowed: boolean
  enabled(): boolean
  toggle(): void
  cores: number
}

export interface VM {
  formattedDate: string
  shouldGoBack: boolean
  cgConfig?: cg.SetConfig
  variationMenu?: Tree.Path
  flip: boolean
  smallBoard: boolean
  analysisProgress: boolean
  showBestMove: boolean
  showComments: boolean
  computingPGN: boolean
  replaying: boolean
}

export interface MenuInterface {
  open: () => void
  close: () => void
  isOpen: () => boolean
  root: AnalyseCtrl
}

export interface ExplorerCtrlInterface {
  allowed: Mithril.Stream<boolean>
  enabled: Mithril.Stream<boolean>
  setStep(): void
  loading: Mithril.Stream<boolean>
  failing: Mithril.Stream<boolean>
  config: any
  withGames: boolean
  current: Mithril.Stream<ExplorerData>
  toggle(): void
}

export interface ExplorerMove {
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

export interface ExplorerPlayer {
  rating: number
  name: string
}

export interface ExplorerGame {
  id: string
  white: ExplorerPlayer
  black: ExplorerPlayer
  year: string
  winner: Color
}

export interface ExplorerData {
  opening?: boolean
  tablebase?: boolean
  moves: Array<ExplorerMove>
  topGames?: Array<ExplorerGame>
  recentGames?: Array<ExplorerGame>
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
