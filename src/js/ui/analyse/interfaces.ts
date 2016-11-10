export interface RoleToSan {
  [role: string]: SanChar
}

export interface SanToRole {
  [san: string]: Role
}

export type Source = 'online' | 'offline';

export interface PathObj {
  ply: number
  variation: any
}

export interface AnalysisData extends GameData {
  // TODO type this
  analysis?: any;
  steps?: Array<AnalysisStep>;
}

export interface AnalysisStep extends GameStep {
  ceval?: Ceval
  rEval?: any
  fixed?: boolean
  variations?: any
  opening?: any
  pgnMoves?: Array<string>
}

export interface CevalWork {
  position: string
  moves: string
  path: Path
  steps: Array<AnalysisStep>
  ply: number
  emit: (res: any) => void
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
  init(): Promise<any>
  isInit(): boolean
  start(path: Path, steps: Array<AnalysisStep>): void
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
  importPgnPopup: ImportPgnPopupInterface
  evalSummary: any
  notes: any

  flip(): void
  jump(path: Path, direction?: 'forward' | 'backward'): void
  userJump(path: Path, direction?: 'forward' | 'backward'): void
  nextStepBest(): string | null
  currentAnyEval(): Ceval | null
  setData(data: AnalysisData): void
  explorerMove(uci: string): void
  debouncedScroll(): void
  gameOver(): boolean
  canDrop(): boolean
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

export type Path = Array<PathObj>

export interface AnalyseInterface {
  tree: any

  firstPly(): number
  lastPly(): number
  getStep(path: Path): AnalysisStep
  getStepAtPly(ply: number): AnalysisStep
  getSteps(path: Path): Array<AnalysisStep>
  getStepsAfterPly(path: Path, ply: number): Array<AnalysisStep>
  getOpening(path: Path): any
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
  importing: Mithril.Stream<boolean>
  submit: (e: Event) => void
  isOpen: () => boolean
}
