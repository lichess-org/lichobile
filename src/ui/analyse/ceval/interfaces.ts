import { Tree } from '../../shared/tree'

export interface NodeEvals {
  client?: Tree.ClientEval
  server?: Tree.ServerEval
}

export interface Eval {
  cp?: number
  mate?: number
}

export interface Opts {
  allowed: boolean
  variant: VariantKey
  multiPv: number
  cores: number
  hashSize: number
  infinite: boolean
}

export interface Work {
  path: string
  maxDepth: number
  multiPv: number
  ply: number
  useNNUE: boolean
  threatMode: boolean
  initialFen: string
  currentFen: string
  moves: string[]
  emit: (ev?: Tree.ClientEval) => void
}

export interface ICevalCtrl {
  init(): Promise<void>
  isInit(): boolean
  isSearching(): boolean
  start(path: Tree.Path, steps: Tree.Node[], forceRetroOpts: boolean, deeper: boolean): void
  stop(): void
  destroy(): void
  allowed: boolean
  enabled(): boolean
  toggle(): void
  disable(): void
  variant: VariantKey
  minDepth: number
  effectiveMaxDepth(): number
  setMultiPv(pv: number): void
  getMultiPv(): number
  toggleInfinite(): void
  goDeeper(): void
  canGoDeeper(): boolean
  getEngineName(): string
  getEngineEvaluation(): string
}

export interface IEngine {
  init(): Promise<void>
  start(work: Work): Promise<void>
  stop(): void
  exit(): Promise<void>
  isSearching(): boolean
  getName(): string
  getEvaluation(): string
}

export interface Started {
  path: Tree.Path
  nodes: Tree.Node[]
}
