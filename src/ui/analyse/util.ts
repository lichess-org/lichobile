import { fixCrazySan } from '../../utils/chessFormat'
import { AnalyseData } from '../../lichess/interfaces/analyse'
import { Tree } from '../shared/tree'
import { Eval, NodeEvals } from './ceval/interfaces'

export function readDrops(line?: string | null): string[] | null {
  if (typeof line === 'undefined' || line === null) return null
  return line.match(/.{2}/g) || []
}

export function readCheckCount(fen: string) {
  const counts = fen.substr(fen.length - 4)
  return {
    white: parseInt(counts[3], 10),
    black: parseInt(counts[1], 10)
  }
}

export function empty(a?: any) {
  return !a || a.length === 0
}

export function renderEval(e: number) {
  e = Math.max(Math.min(Math.round(e / 10) / 10, 99), -99)
  return (e > 0 ? '+' : '') + e
}

const serverNodes = 4e6
export function getBestEval(evs: NodeEvals): Eval | undefined {
  const serverEv = evs.server, localEv = evs.client

  if (!serverEv) return localEv
  if (!localEv) return serverEv

  // Prefer localEv if it exeeds fishnet node limit or finds a better mate.
  if (localEv.nodes > serverNodes ||
    (typeof localEv.mate !== 'undefined' && (typeof serverEv.mate === 'undefined' || Math.abs(localEv.mate) < Math.abs(serverEv.mate))))
  return localEv

  return serverEv
}

export function isSynthetic(data: AnalyseData) {
  return data.game.id === 'synthetic'
}

export function autoScroll(movelist: HTMLElement | null) {
  if (!movelist) return
  requestAnimationFrame(() => {
    const plyEl = movelist.querySelector('.current') as HTMLElement
    if (plyEl) {
      movelist.scrollTop = plyEl.offsetTop - movelist.offsetHeight / 2 + plyEl.offsetHeight / 2
    } else {
      movelist.scrollTop = 0
    }
  })
}

export function plyToTurn(ply: number): number {
  return Math.floor((ply - 1) / 2) + 1
}

export function nodeFullName(node: Tree.Node) {
  if (node.san) return plyToTurn(node.ply) + (
    node.ply % 2 === 1 ? '.' : '...'
  ) + ' ' + fixCrazySan(node.san)
  return 'Initial position'
}

function pieceCount(fen: string) {
  const parts = fen.split(/\s/)
  return parts[0].split(/[nbrqkp]/i).length - 1
}

function tablebasePieces(variant: VariantKey) {
  switch (variant) {
    case 'standard':
    case 'fromPosition':
    case 'chess960':
      return 7
    case 'atomic':
    case 'antichess':
      return 6
    default:
      return 0
  }
}

export function tablebaseGuaranteed(variant: VariantKey, fen: string) {
  return pieceCount(fen) <= tablebasePieces(variant)
}

export function defined<A>(v: A | undefined): v is A {
  return v !== undefined
}

export function plyColor(ply: number): Color {
  return (ply % 2 === 0) ? 'white' : 'black'
}
