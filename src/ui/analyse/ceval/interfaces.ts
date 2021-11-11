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
  threatMode: boolean
  initialFen: string
  currentFen: string
  moves: string[]
  emit: (ev?: Tree.ClientEval) => void
}

export interface Started {
  path: Tree.Path
  nodes: Tree.Node[]
}
