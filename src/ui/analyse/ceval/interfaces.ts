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
  multiPv: number
  cores: number
  infinite: boolean
}

export interface Work {
  path: string
  maxDepth: number
  cores: number
  multiPv: number
  ply: number
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
  start(path: Tree.Path, steps: Tree.Node[], forceRetroOpts: boolean): void
  stop(): void
  destroy(): void
  allowed: boolean
  enabled(): boolean
  toggle(): void
  variant: VariantKey
  minDepth: number
  maxDepth: number
  opts: Opts
  setCores(c: number): void
  setMultiPv(pv: number): void
  toggleInfinite(): void
}

export interface IEngine {
  init(): Promise<void>
  start(work: Work): void
  stop(): void
  exit(): Promise<void>
  isSearching(): boolean
}
