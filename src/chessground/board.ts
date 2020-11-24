import { State } from './state'
import * as cg from './interfaces'
import * as util from './util'
import premove from './premove'

export function toggleOrientation(state: State): void {
  state.orientation = util.opposite(state.orientation)
}

export function reset(state: State): void {
  state.lastMove = null
  setSelected(state, null)
  unsetPremove(state)
  unsetPredrop(state)
}

export function setPieces(state: State, pieces: cg.PiecesDiff): void {
  for (const [key, piece] of pieces) {
    if (piece) state.pieces.set(key, piece)
    else state.pieces.delete(key)
  }
}

export function setCheck(state: State, color: Color | boolean): void {
  state.check = null
  if (color === true) color = state.turnColor
  if (color) {
    for (const [k, v] of state.pieces) {
      if (v.role === 'king' && v.color === color) {
        state.check = k
      }
    }
  }
}

export function setPremove(state: State, orig: Key, dest: Key): void {
  unsetPredrop(state)
  state.premovable.current = [orig, dest]
  util.callUserFunction(state.premovable.events.set, orig, dest)
}

export function unsetPremove(state: State): void {
  if (state.premovable.current) {
    state.premovable.current = null
    util.callUserFunction(state.premovable.events.unset)
  }
}

export function setPredrop(state: State, role: Role, key: Key): void {
  unsetPremove(state)
  state.predroppable.current = {
    role: role,
    key
  } as cg.Drop
  util.callUserFunction(state.predroppable.events.set, role, key)
}

export function unsetPredrop(state: State): void {
  if (state.predroppable.current) {
    state.predroppable.current = null
    util.callUserFunction(state.predroppable.events.unset)
  }
}

export function apiMove(state: State, orig: Key, dest: Key): boolean {
  return baseMove(state, orig, dest)
}

export function apiNewPiece(state: State, piece: Piece, key: Key): boolean {
  return baseNewPiece(state, piece, key)
}

export function userMove(state: State, orig: Key, dest: Key): boolean {
  if (canMove(state, orig, dest)) {
    const result = baseUserMove(state, orig, dest)
    if (result) {
      setSelected(state, null)
      util.callUserFunction(state.movable.events.after, orig, dest, { premove: false })
      return true
    }
  }
  else if (canPremove(state, orig, dest)) {
    setPremove(state, orig, dest)
    setSelected(state, null)
  }
  else if (isMovable(state, dest) || isPremovable(state, dest)) {
    setSelected(state, dest)
  } else {
    unselect(state)
  }

  return false
}

export function dropNewPiece(state: State, orig: Key, dest: Key, force = false): void {
  const piece = state.pieces.get(orig)
  if (piece && (canDrop(state, orig, dest) || force)) {
    state.pieces.delete(orig)
    baseNewPiece(state, piece, dest, force)
    util.callUserFunction(state.movable.events.afterNewPiece, piece.role, dest, {
      predrop: false
    })
  } else if (piece && canPredrop(state, orig, dest)) {
    setPredrop(state, piece.role, dest)
  } else {
    unsetPremove(state)
    unsetPredrop(state)
  }
  state.pieces.delete(orig)
  setSelected(state, null)
}

export function selectSquare(state: State, key: Key): void {
  if (state.selected) {
    if (state.selected === key && !state.draggable.enabled) {
      unselect(state)
    } else if (state.selectable.enabled && state.selected !== key) {
      userMove(state, state.selected, key)
    }
  } else if (isMovable(state, key) || isPremovable(state, key)) {
    setSelected(state, key)
  }
}

export function setSelected(state: State, key: Key | null): void {
  state.selected = key
  if (key && isPremovable(state, key))
    state.premovable.dests = premove(state.pieces, key, state.premovable.castle)
  else
    state.premovable.dests = null
}

export function unselect(state: State): void {
  state.selected = null
  state.premovable.dests = null
}

export function isMovable(state: State, orig: Key): boolean {
  const piece = state.pieces.get(orig)
  return !!piece && (
    state.movable.color === 'both' || (
      state.movable.color === piece.color &&
      state.turnColor === piece.color
    ))
}

export function canMove(state: State, orig: Key, dest: Key): boolean {
  return orig !== dest && isMovable(state, orig) && (
    state.movable.free || (state.movable.dests !== null && util.containsX(state.movable.dests[orig], dest))
  )
}

export function canDrop(state: State, orig: Key, dest: Key): boolean {
  const piece = state.pieces.get(orig)
  return !!piece && dest && (orig === dest || !state.pieces.has(dest)) && (
    state.movable.color === 'both' || (
      state.movable.color === piece.color &&
      state.turnColor === piece.color
    ))
}

export function isPremovable(state: State, orig: Key): boolean {
  const piece = state.pieces.get(orig)
  return !!piece && state.premovable.enabled &&
    state.movable.color === piece.color &&
    state.turnColor !== piece.color
}

export function canPremove(state: State, orig: Key, dest: Key): boolean {
  return orig !== dest &&
    isPremovable(state, orig) &&
    util.containsX(premove(state.pieces, orig, state.premovable.castle), dest)
}

export function canPredrop(state: State, orig: Key, dest: Key): boolean {
  const piece = state.pieces.get(orig)
  const destPiece = state.pieces.get(dest)
  return !!piece && dest &&
    (!destPiece || destPiece.color !== state.movable.color) &&
    state.predroppable.enabled &&
    (piece.role !== 'pawn' || (dest[1] !== '1' && dest[1] !== '8')) &&
    state.movable.color === piece.color &&
    state.turnColor !== piece.color
}

export function isDraggable(state: State, orig: Key): boolean {
  const piece = state.pieces.get(orig)
  return !!piece && state.draggable.enabled && (
    state.movable.color === 'both' || (
      state.movable.color === piece.color && (
        state.turnColor === piece.color || state.premovable.enabled
      )
    )
  )
}

export function playPremove(state: State): void {
  const move = state.premovable.current
  if (!move) return
  const orig = move[0], dest = move[1]
  if (canMove(state, orig, dest)) {
    if (baseUserMove(state, orig, dest)) {
      util.callUserFunction(state.movable.events.after, orig, dest, {
        premove: true
      })
    }
  }
  unsetPremove(state)
}

export function playPredrop(state: State, validate: (d: cg.Drop) => boolean): boolean {
  const drop = state.predroppable.current
  if (!drop) return false
  let success = false
  if (validate(drop)) {
    const piece = {
      role: drop.role,
      color: state.movable.color
    } as Piece
    if (baseNewPiece(state, piece, drop.key)) {
      util.callUserFunction(state.movable.events.afterNewPiece, drop.role, drop.key, {
        predrop: true
      })
      success = true
    }
  }
  unsetPredrop(state)
  return success
}

export function cancelMove(state: State): void {
  unsetPremove(state)
  unsetPredrop(state)
  setSelected(state, null)
}

export function stop(state: State): void {
  state.movable.color = null
  state.movable.dests = {}
  cancelMove(state)
}

function baseMove(state: State, orig: Key, dest: Key): boolean {
  const origPiece = state.pieces.get(orig)
  if (orig === dest || !origPiece) {
    return false
  }
  const destPiece = state.pieces.get(dest)
  const captured = (
    destPiece && destPiece.color !== origPiece.color
  ) ? destPiece : undefined
  util.callUserFunction(state.events.move, orig, dest, captured)
  if (!tryAutoCastle(state, orig, dest)) {
    state.pieces.set(dest, origPiece)
    state.pieces.delete(orig)
  }
  state.lastMove = [orig, dest]
  state.check = null
  util.callUserFunction(state.events.change)
  return true
}

function baseNewPiece(state: State, piece: Piece, key: Key, force = false): boolean {
  if (state.pieces.has(key)) {
    if (force) state.pieces.delete(key)
    else return false
  }
  util.callUserFunction(state.events.dropNewPiece, piece, key)
  state.pieces.set(key, piece)
  state.lastMove = [key, key]
  state.check = null
  util.callUserFunction(state.events.change)
  state.movable.dests = {}
  state.turnColor = util.opposite(state.turnColor)
  return true
}

function baseUserMove(state: State, orig: Key, dest: Key): boolean {
  const result = baseMove(state, orig, dest)
  if (result) {
    state.movable.dests = null
    state.turnColor = util.opposite(state.turnColor)
    state.animation.current = null
  }
  return result
}

function tryAutoCastle(state: State, orig: Key, dest: Key): boolean {
  if (!state.autoCastle) return false

  const king = state.pieces.get(orig)
  if (!king || king.role !== 'king') return false

  const origPos = util.key2pos(orig)
  const destPos = util.key2pos(dest)
  if ((origPos[1] !== 1 && origPos[1] !== 8) || origPos[1] !== destPos[1]) return false
  if (origPos[0] === 5 && !state.pieces.has(dest)) {
    if (destPos[0] === 7) dest = util.pos2key([8, destPos[1]])
    else if (destPos[0] === 3) dest = util.pos2key([1, destPos[1]])
  }
  const rook = state.pieces.get(dest)
  if (!rook || rook.color !== king.color || rook.role !== 'rook') return false

  state.pieces.delete(orig)
  state.pieces.delete(dest)

  if (origPos[0] < destPos[0]) {
    state.pieces.set(util.pos2key([7, destPos[1]]), king)
    state.pieces.set(util.pos2key([6, destPos[1]]), rook)
  } else {
    state.pieces.set(util.pos2key([3, destPos[1]]), king)
    state.pieces.set(util.pos2key([4, destPos[1]]), rook)
  }

  return true
}
