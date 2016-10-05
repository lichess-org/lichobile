export interface RoleToSan {
  [role: string]: San
}

export interface SanToRole {
  [san: string]: Role
}

export type Source = 'online' | 'offline' | 'fen';

export interface PathObj {
  ply: number
  variation: any
}

export interface AnalyseCtrlInterface {
  data: AnalysisData
  source: Source
  vm: any
  explorer: ExplorerCtrlInterface
  chessground: Chessground.Controller

  setData(data: AnalysisData): void
  explorerMove(uci: string): void
  debouncedScroll(): void
}

export interface ExplorerCtrlInterface {
  allowed: Mithril.Property<boolean>
  enabled: Mithril.Property<boolean>
  setStep(): void
  loading: Mithril.Property<boolean>
  failing: Mithril.Property<boolean>
  config: any
  withGames: boolean
  current: Mithril.Property<ExplorerData>
  toggle(): void
}

export type Path = Array<PathObj>

export interface AnalyseInterface {
  firstPly(): number
  lastPly(): number
  getStep(path: Path): AnalysisStep
  getStepAtPly(ply: number): AnalysisStep
  getSteps(path: Path): Array<AnalysisStep>
  getStepsAfterPly(path: Path, ply: number): Array<AnalysisStep>
  getOpening(path: Path): any
  nextStepEvalBest(path: Path): number
  addStep(step: AnalysisStep, path: Path): Path
  addDests(dests: DestsMap, path: Path): void
  updateAtPath(path: Path, update: (s: AnalysisStep) => void): void
  deleteVariation(ply: number, id: number): void
  promoteVariation(ply: number, id: number): void
  plyOfNextNag(color: Color, nag: string, fromPly: number): number
}

export interface ExplorerMove {
  white: number
  black: number
  draws: number
  real_wdl: number
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
  fen?: string
  moves: Array<ExplorerMove>
  topGames?: Array<ExplorerGame>
  recentGames?: Array<ExplorerGame>
  checkmate?: boolean
  stalemate?: boolean
}

export interface ImportPgnPopupInterface {
  open: () => void
  close: () => void
  importing: Mithril.Property<boolean>
  submit: (e: Event) => void
  isOpen: () => boolean
}
