export interface RoleToSan {
  [role: string]: San
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
  url?: {
    round: string;
    socket: string;
  }
}

export interface AnalysisStep extends GameStep {
  ceval?: Ceval
  rEval?: any
  fixed?: boolean
  variations?: any
  opening?: any
  pgnMoves?: Array<string>
}

export interface Work {
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
  work: Work
  ceval: Ceval
}

export interface CevalCtrlInterface {
  init(): Promise<any>
  isInit(): boolean
  start(path: Path, steps: Array<AnalysisStep>): void
  stop(): void
  destroy(): void
  allowed: Mithril.Property<boolean>,
  enabled(): boolean,
  toggle(): void
  percentComplete(): number
}

export interface AnalyseCtrlInterface {
  data: AnalysisData
  source: Source
  vm: any
  analyse: AnalyseInterface
  explorer: ExplorerCtrlInterface
  chessground: Chessground.Controller

  userJump(path: Path, direction?: 'forward' | 'backward'): void
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
  tree: any

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
