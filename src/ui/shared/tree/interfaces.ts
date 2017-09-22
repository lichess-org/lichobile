import { Pockets } from '../../../lichess/interfaces/game'

export namespace Tree {
  export type Path = string

  export interface ClientEval {
    fen: string
    maxDepth: number
    depth: number
    knps: number
    nodes: number
    millis: number
    pvs: PvData[]
    cloud?: boolean
    cp?: number
    mate?: number
    retried?: boolean
    // maybe not keep here
    best?: Uci
    bestSan?: San
  }

  export interface ServerEval {
    cp?: number
    mate?: number
    best?: Uci
  }

  export interface PvData {
    moves: string[]
    mate?: number
    cp?: number
  }

  export interface Node {
    id: string
    ply: Ply
    fen: Fen
    children: Node[]
    drops?: string | string[] | undefined | null
    uci?: Uci
    san?: San
    comments?: Comment[]
    // TODO maybe don't keep both formats for dests & drops
    dests?: string | DestsMap
    check?: boolean
    threat?: ClientEval
    ceval?: ClientEval
    eval?: ServerEval
    opening?: Opening | null
    glyphs?: Glyph[]
    clock?: Clock
    parentClock?: Clock
    shapes?: Shape[]
    comp?: boolean
    threefold?: boolean
    fail?: boolean
    puzzle?: string
    // added dynamically during analysis from chess worker
    checkCount?: { white: number, black: number }
    pgnMoves?: string[]
    player?: Color
    end?: boolean
    crazyhouse?: {
      pockets: Pockets
    }
  }

  export interface Comment {
    id: string
    by: string | {
      id: string
      name: string
    }
    text: string
  }

  export interface Opening {
    name: string
    eco: string
  }

  export interface Glyph {
    name: string
    symbol: string
  }

  export type Clock = number

  export interface Shape {
  }
}

export function isClientEval(ev: Tree.ServerEval | Tree.ClientEval): ev is Tree.ClientEval {
  return (ev as Tree.ClientEval).depth !== undefined
}
