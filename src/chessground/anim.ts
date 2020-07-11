import { batchRequestAnimationFrame } from '../utils/batchRAF'
import * as cg from './interfaces'
import * as util from './util'
import { State } from './state'
import Chessground from './Chessground'

export type Mutation<A> = (state: State) => A

export interface AnimVector {
  0: NumberPair // animation goal
  1: NumberPair // animation current status
}
type AnimVectors = Map<Key, AnimVector>
type AnimCaptured = Map<Key, Piece>

export interface AnimPlan {
  anims: AnimVectors
  captured: AnimCaptured
}

export interface AnimCurrent {
  start: number | null
  duration: number
  plan: AnimPlan
}

interface AnimPiece {
  key: Key
  pos: cg.Pos
  piece: Piece
}

type AnimPieces = Map<Key, AnimPiece>

export function anim<A>(mutation: Mutation<A>, ctrl: Chessground): A {
  return ctrl.state.animation.enabled ? animate(mutation, ctrl) : skip(mutation, ctrl)
}

export function skip<A>(mutation: Mutation<A>, ctrl: Chessground): A {
  const result = mutation(ctrl.state)
  ctrl.redraw()
  return result
}

function makePiece(key: Key, piece: Piece): AnimPiece {
  return {
    key,
    pos: util.key2pos(key),
    piece
  }
}

function samePiece(p1: Piece, p2: Piece) {
  return p1.role === p2.role && p1.color === p2.color
}

function closer(piece: AnimPiece, pieces: AnimPiece[]) {
  return pieces.sort((p1, p2) => {
    return util.distance(piece.pos, p1.pos) - util.distance(piece.pos, p2.pos)
  })[0]
}

function computePlan(prevPieces: cg.Pieces, state: State, dom: cg.DOM): AnimPlan {
  const bounds = dom.bounds,
    width = bounds.width / 8,
    height = bounds.height / 8,
    anims: AnimVectors = new Map(),
    animedOrigs: Key[] = [],
    capturedPieces: AnimCaptured = new Map(),
    missings: AnimPiece[] = [],
    news: AnimPiece[] = [],
    prePieces: AnimPieces = new Map(),
    white = state.orientation === 'white'

  for (const [k, p] of prevPieces) {
    prePieces.set(k, makePiece(k, p))
  }

  for (let i = 0, ilen = util.allKeys.length; i < ilen; i++) {
    const key = util.allKeys[i]
    const curP = state.pieces.get(key)
    const preP = prePieces.get(key)
    if (curP) {
      if (preP) {
        if (!samePiece(curP, preP.piece)) {
          missings.push(preP)
          news.push(makePiece(key, curP))
        }
      }
      else {
        news.push(makePiece(key, curP))
      }
    }
    else if (preP) {
      missings.push(preP)
    }
  }
  for (const newP of news) {
    const nPreP = closer(newP, missings.filter((p) => samePiece(newP.piece, p.piece)))
    if (nPreP) {
      const orig = white ? nPreP.pos : newP.pos
      const dest = white ? newP.pos : nPreP.pos
      const pos: NumberPair = [(orig[0] - dest[0]) * width, (dest[1] - orig[1]) * height]
      anims.set(newP.key, [pos, pos])
      animedOrigs.push(nPreP.key)
    }
  }
  for (const p of missings) {
    if (!util.containsX(animedOrigs, p.key)) {
      capturedPieces.set(p.key, p.piece)
    }
  }

  return {
    anims,
    captured: capturedPieces
  }
}

function animate<A>(mutation: Mutation<A>, ctrl: Chessground): A {
  const state = ctrl.state
  // clone state before mutating it
  const prevPieces: cg.Pieces = new Map(state.pieces)
  const result = mutation(state)
  const plan = ctrl.dom !== undefined ?
    computePlan(prevPieces, state, ctrl.dom) : undefined
  if (plan !== undefined && (plan.anims.size || plan.captured.size)) {
    const alreadyRunning = state.animation.current && state.animation.current.start !== null
    state.animation.current = {
      start: null,
      duration: state.animation.duration,
      plan
    }
    if (!alreadyRunning) {
      batchRequestAnimationFrame(ctrl.applyAnim)
    }
  } else {
    ctrl.redraw()
  }
  return result
}
