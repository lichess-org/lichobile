import { Tree } from '../../shared/tree'

export interface Work {
  initialFen: string
  currentFen: string
  moves: string
  path: Tree.Path
  steps: Tree.Node[]
  ply: number
  emit: (res: Emit) => void
}

export interface Emit {
  work: Work
  ceval: Tree.ClientEval
}

export interface ICevalCtrl {
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

