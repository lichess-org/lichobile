import * as cg from './interfaces'
import * as util from './util'
import { State } from './state'
import Chessground from './Chessground'

export type Mutation<A> = (state: State) => A

export interface AnimVector {
  0: NumberPair // animation goal
  1: NumberPair // animation current status
}

export interface AnimVectors {
  [key: string]: AnimVector
}

export interface AnimCaptured {
  [key: string]: Piece
}

export interface AnimPlan {
  anims: AnimVectors
  captured: AnimCaptured
}

export interface AnimCurrent {
  start: number
  duration: number
  plan: AnimPlan
}

interface AnimPiece {
  key: Key
  pos: cg.Pos
  piece: Piece
}

interface AnimPieces {
  [key: string]: AnimPiece
}

export function anim<A>(mutation: Mutation<A>, ctrl: Chessground): A {
  return ctrl.state.animation.enabled ? animate(mutation, ctrl) : skip(mutation, ctrl)
}

export function skip<A>(mutation: Mutation<A>, ctrl: Chessground): A {
  const result = mutation(ctrl.state)
  ctrl.redraw()
  return result
}

// https://gist.github.com/gre/1650294
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
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
    anims: AnimVectors = {},
    animedOrigs: Key[] = [],
    capturedPieces: AnimCaptured = {},
    missings: AnimPiece[] = [],
    news: AnimPiece[] = [],
    prePieces: AnimPieces = {},
    white = state.orientation === 'white'

  for (const pk in prevPieces) {
    prePieces[pk] = makePiece(pk as Key, prevPieces[pk])
  }

  for (let i = 0, ilen = util.allKeys.length; i < ilen; i++) {
    const key = util.allKeys[i]
    const curP = state.pieces[key]
    const preP = prePieces[key]
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
  news.forEach((newP) => {
    const nPreP = closer(newP, missings.filter((p) => samePiece(newP.piece, p.piece)))
    if (nPreP) {
      const orig = white ? nPreP.pos : newP.pos
      const dest = white ? newP.pos : nPreP.pos
      const pos: NumberPair = [(orig[0] - dest[0]) * width, (dest[1] - orig[1]) * height]
      anims[newP.key] = [pos, pos]
      animedOrigs.push(nPreP.key)
    }
  })
  missings.forEach((p) => {
    if (!util.containsX(animedOrigs, p.key)) {
      capturedPieces[p.key] = p.piece
    }
  })

  return {
    anims,
    captured: capturedPieces
  }
}

function roundBy(n: number, by: number) {
  return Math.round(n * by) / by
}

function step(ctrl: Chessground) {
  const state = ctrl.state
  const cur = state.animation.current
  if (!cur) return
  // animation was canceled
  if (!cur) return
  const rest = 1 - (Date.now() - cur.start) / cur.duration
  if (rest <= 0) {
    state.animation.current = null
    ctrl.redrawSync()
  } else {
    const ease = easeInOutCubic(rest)
    const anims = cur.plan.anims
    const animsK = Object.keys(anims)
    for (let i = 0, len = animsK.length; i < len; i++) {
      const key = animsK[i]
      const cfg = anims[key]
      cfg[1] = [roundBy(cfg[0][0] * ease, 10), roundBy(cfg[0][1] * ease, 10)]
    }
    ctrl.redrawSync()
    state.batchRAF(() => step(ctrl))
  }
}

function animate<A>(mutation: Mutation<A>, ctrl: Chessground) {
  const state = ctrl.state
  const prevPieces: cg.Pieces = {...state.pieces}
  const result = mutation(state)
  const plan = computePlan(prevPieces, state, ctrl.dom!)
  if (Object.keys(plan.anims).length > 0 || Object.keys(plan.captured).length > 0) {
    const alreadyRunning = state.animation.current && state.animation.current.start
    state.animation.current = {
      start: Date.now(),
      duration: state.animation.duration,
      plan
    }
    if (!alreadyRunning) state.batchRAF(() => step(ctrl))
  } else {
    ctrl.redraw()
  }
  return result
}
