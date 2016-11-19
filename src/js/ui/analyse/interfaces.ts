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

// TODO refactor to keep only one interface for remove eval
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

export interface AnalysisStep extends GameStep {
  ceval?: Ceval
  rEval?: RemoteEval
  fixed?: boolean
  variations?: Array<AnalysisTree>
  pgnMoves?: Array<string>
  nag?: string
}

export interface CevalWork {
  initialFen: string
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
  allowed: Mithril.Stream<boolean>,
  enabled(): boolean,
  toggle(): void
  percentComplete(): number
}

export interface VM {
  shouldGoBack: boolean
  path: Path
  pathStr: string
  step: AnalysisStep
  cgConfig: Chessground.SetConfig
  variationMenu: string
  flip: boolean
  analysisProgress: boolean
  showBestMove: boolean
  showComments: boolean
}

export interface AnalyseCtrlInterface {
  data: AnalysisData
  source: Source
  vm: VM
  analyse: AnalyseInterface
  explorer: ExplorerCtrlInterface
  chessground: Chessground.Controller
  ceval: CevalCtrlInterface
  menu: any
  continuePopup: any
  settings: any
  evalSummary: any
  notes: any

  flip(): void
  jump(path: Path, direction?: 'forward' | 'backward'): void
  userJump(path: Path, direction?: 'forward' | 'backward'): void
  nextStepBest(): string | null
  currentAnyEval(): Ceval | RemoteEval
  setData(data: AnalysisData): void
  explorerMove(uci: string): void
  debouncedScroll(): void
  gameOver(): boolean
  canDrop(): boolean
  toggleVariationMenu(path?: Path): void
  deleteVariation(path: Path): void
  promoteVariation(path: Path): void
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
  nextStepEvalBest(path: Path): string | null
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
