import { Controller as ContinuePopupController } from '../shared/continuePopup'

export interface RoleToSan {
  [role: string]: SanChar
}

export interface SanToRole {
  [san: string]: Role
}

export type Source = 'online' | 'offline';

export interface PathObj {
  ply: number
  variation: number
}

export type AnalysisTree = Array<AnalysisStep>
export type Path = Array<PathObj>

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
}

export interface RemoteEvalSummary {
  white: PlayerEvalSummary
  black: PlayerEvalSummary
}

export interface RemoteAnalysis {
  moves: Array<RemoteAnalysisMove>
  summary: RemoteEvalSummary
}

export interface AnalysisData extends GameData {
  analysis?: RemoteAnalysis
  steps?: AnalysisTree
}

export interface Glyph {
  symbol: string
  name: string
}

// everything is optional bc fetched async with chess.ts worker
// for online game data
export interface AnalysisStep extends GameStep {
  ceval?: Ceval
  rEval?: RemoteEval
  fixed?: boolean
  variations?: Array<AnalysisTree>
  pgnMoves?: Array<string>
  end?: boolean
  nag?: string
  player?: Color
  opening?: Opening
}

export interface CevalWork {
  initialFen: string
  currentFen: string
  moves: string
  path: Path
  steps: AnalysisTree
  ply: number
  emit: (res: CevalEmit) => void
}

export interface Ceval {
  depth: number
  maxDepth: number
  cp: number
  mate: number
  best: string
  nps: number
  bestSan?: string
}

export interface CevalEmit {
  work: CevalWork
  ceval: Ceval
}

export interface CevalCtrlInterface {
  init(): Promise<void>
  isInit(): boolean
  start(path: Path, steps: AnalysisTree): void
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
  path: Path
  pathStr: string
  step?: AnalysisStep
  cgConfig: Chessground.SetConfig
  variationMenu: Path | null
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
  root: AnalyseCtrlInterface
}

export interface AnalyseCtrlInterface {
  data: AnalysisData
  source: Source
  vm: VM
  analyse: AnalyseInterface
  chessground: Chessground.Controller
  explorer: ExplorerCtrlInterface
  ceval: CevalCtrlInterface
  menu: MenuInterface
  continuePopup: ContinuePopupController
  settings: MenuInterface
  evalSummary: MenuInterface
  notes: any

  player(): Color
  flip(): void
  toggleBoardSize(): void
  jump(path: Path, direction?: 'forward' | 'backward'): void
  userJump(path: Path, direction?: 'forward' | 'backward'): void
  fastforward(): boolean
  rewind(): boolean
  stopff(): void
  stoprewind(): void
  nextStepBest(): string | null
  explorerMove(uci: string): void
  debouncedScroll(): void
  gameOver(): boolean
  canDrop(): boolean
  toggleVariationMenu(path?: Path): void
  deleteVariation(path: Path): void
  promoteVariation(path: Path): void
  initCeval(): void
  toggleBestMove(): void
  toggleComments(): void
  sharePGN(): void
  isRemoteAnalysable(): boolean
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


export interface AnalyseInterface {
  tree: AnalysisTree

  firstPly(): number
  lastPly(): number
  getStep(path: Path): AnalysisStep
  getStepAtPly(ply: number): AnalysisStep
  getSteps(path: Path): AnalysisTree
  getStepsAfterPly(path: Path, ply: number): AnalysisTree
  getOpening(path: Path): Opening | undefined
  nextStepEvalBest(path: Path): string | null
  addStep(step: AnalysisStep, path: Path): Path
  addStepSituationData(situation: GameSituation, path: Path): void
  updateAtPath(path: Path, update: (s: AnalysisStep) => void): void
  deleteVariation(ply: number, id: number): void
  promoteVariation(ply: number, id: number): void
  plyOfNextNag(color: Color, nag: string, fromPly: number): number
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
  fen?: string
  moves: Array<ExplorerMove>
  topGames?: Array<ExplorerGame>
  recentGames?: Array<ExplorerGame>
  checkmate?: boolean
  stalemate?: boolean
  variant_win?: boolean
  variant_loss?: boolean
}
