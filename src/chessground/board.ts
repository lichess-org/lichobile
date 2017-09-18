import { State } from './state'
import * as cg from './interfaces'
import * as util from './util'
import premove from './premove'

export function toggleOrientation(state: State) {
  state.orientation = util.opposite(state.orientation)
}

export function reset(state: State) {
  state.lastMove = null
  setSelected(state, null)
  unsetPremove(state)
  unsetPredrop(state)
}

export function setPieces(state: State, pieces: cg.PiecesDiff) {
  for (let key in pieces) {
    const piece = pieces[key]
    if (piece) state.pieces[key] = piece
    else delete state.pieces[key]
  }
}

export function setCheck(state: State, color: Color | boolean) {
  if (color === true) color = state.turnColor
  if (!color) state.check = null
  else for (let k in state.pieces) {
    if (state.pieces[k].role === 'king' && state.pieces[k].color === color) {
      state.check = k as Key
    }
  }
}

export function setPremove(state: State, orig: Key, dest: Key) {
  unsetPredrop(state)
  state.premovable.current = [orig, dest]
  setTimeout(() => {
    if (state.premovable.events.set) state.premovable.events.set(orig, dest)
  }, 0)
}

export function unsetPremove(state: State) {
  if (state.premovable.current) {
    state.premovable.current = null
    setTimeout(state.premovable.events.unset)
  }
}

export function setPredrop(state: State, role: Role, key: Key) {
  unsetPremove(state)
  state.predroppable.current = {
    role: role,
    key
  } as cg.Drop
  setTimeout(() => {
    if (state.predroppable.events.set) state.predroppable.events.set(role, key)
  }, 0)
}

export function unsetPredrop(state: State) {
  if (state.predroppable.current) {
    state.predroppable.current = null
    setTimeout(() => {
      if (state.predroppable.events.unset) state.predroppable.events.unset()
    })
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
      setTimeout(() => {
        if (state.movable.events.after) state.movable.events.after(orig, dest, {
          premove: false
        })
      })
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

export function dropNewPiece(state: State, orig: Key, dest: Key, force = false) {
  if (canDrop(state, orig, dest) || force) {
    const piece = state.pieces[orig]
    delete state.pieces[orig]
    baseNewPiece(state, piece, dest, force)
    setTimeout(() => {
      if (state.movable.events.afterNewPiece) state.movable.events.afterNewPiece(piece.role, dest, {
        premove: false,
        predrop: false
      })
    })
  } else if (canPredrop(state, orig, dest)) {
    setPredrop(state, state.pieces[orig].role, dest)
  } else {
    unsetPremove(state)
    unsetPredrop(state)
  }
  delete state.pieces[orig]
  setSelected(state, null)
}

export function selectSquare(state: State, key: Key) {
  if (state.selected) {
    if (key) {
      if (state.selected !== key) userMove(state, state.selected, key)
    } else setSelected(state, null)
  } else if (isMovable(state, key) || isPremovable(state, key)) setSelected(state, key)
}

export function setSelected(state: State, key: Key | null) {
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

export function isMovable(state: State, orig: Key) {
  const piece = state.pieces[orig]
  return piece && (
    state.movable.color === 'both' || (
      state.movable.color === piece.color &&
      state.turnColor === piece.color
    ))
}

export function canMove(state: State, orig: Key, dest: Key) {
  return orig !== dest && isMovable(state, orig) && (
    state.movable.free || (!!state.movable.dests && util.containsX(state.movable.dests[orig], dest))
  )
}

export function canDrop(state: State, orig: Key, dest: Key) {
  const piece = state.pieces[orig]
  return piece && dest && (orig === dest || !state.pieces[dest]) && (
    state.movable.color === 'both' || (
      state.movable.color === piece.color &&
      state.turnColor === piece.color
    ))
}

export function isPremovable(state: State, orig: Key) {
  const piece = state.pieces[orig]
  return piece && state.premovable.enabled &&
    state.movable.color === piece.color &&
    state.turnColor !== piece.color
}

export function canPremove(state: State, orig: Key, dest: Key) {
  return orig !== dest &&
    isPremovable(state, orig) &&
    util.containsX(premove(state.pieces, orig, state.premovable.castle), dest)
}

export function canPredrop(state: State, orig: Key, dest: Key) {
  const piece = state.pieces[orig]
  return piece && dest &&
    (!state.pieces[dest] || state.pieces[dest].color !== state.movable.color) &&
    state.predroppable.enabled &&
    (piece.role !== 'pawn' || (dest[1] !== '1' && dest[1] !== '8')) &&
    state.movable.color === piece.color &&
    state.turnColor !== piece.color
}

export function isDraggable(state: State, orig: Key) {
  const piece = state.pieces[orig]
  return piece && state.draggable.enabled && (
    state.movable.color === 'both' || (
      state.movable.color === piece.color && (
        state.turnColor === piece.color || state.premovable.enabled
      )
    )
  )
}

export function playPremove(state: State) {
  const move = state.premovable.current
  if (!move) return
  const orig = move[0], dest = move[1]
  if (canMove(state, orig, dest)) {
    if (baseUserMove(state, orig, dest)) {
      setTimeout(() => {
        if (state.movable.events.after) state.movable.events.after(orig, dest, {
          premove: true
        })
      })
    }
  }
  unsetPremove(state)
}

export function playPredrop(state: State, validate: (d: cg.Drop) => boolean) {
  const drop = state.predroppable.current
  if (!drop) return false
  let success = false
  if (validate(drop)) {
    const piece = {
      role: drop.role,
      color: state.movable.color
    } as Piece
    if (baseNewPiece(state, piece, drop.key)) {
      setTimeout(() => {
        if (state.movable.events.afterNewPiece) state.movable.events.afterNewPiece(drop.role, drop.key, {
          premove: false,
          predrop: true
        })
      })
      success = true
    }
  }
  unsetPredrop(state)
  return success
}

export function cancelMove(state: State) {
  unsetPremove(state)
  unsetPredrop(state)
  setSelected(state, null)
}

export function stop(state: State) {
  state.movable.color = null
  state.movable.dests = {}
  cancelMove(state)
}

export function getKeyAtDomPos(state: State, pos: NumberPair, bounds: ClientRect): Key | null {
  if (typeof bounds !== 'object') {
    throw new Error('function getKeyAtDomPos require bounds object arg')
  }
  const asWhite = state.orientation === 'white'
  const x = Math.ceil(8 * ((pos[0] - bounds.left) / bounds.width))
  const ox = (asWhite ? x : 9 - x) as cg.Coord
  const y = Math.ceil(8 - (8 * ((pos[1] - bounds.top) / bounds.height)))
  const oy = (asWhite ? y : 9 - y) as cg.Coord
  if (ox > 0 && ox < 9 && oy > 0 && oy < 9) {
    return util.pos2key([ox, oy])
  }
  return null
}

function baseMove(state: State, orig: Key, dest: Key): boolean {
  if (orig === dest || !state.pieces[orig]) return false
  const captured = (
    state.pieces[dest] &&
    state.pieces[dest].color !== state.pieces[orig].color
  ) ? state.pieces[dest] : undefined
  // always call events.move
  setTimeout(() => {
    if (state.events.move) state.events.move(orig, dest, captured)
  }, 0)
  state.pieces[dest] = state.pieces[orig]
  delete state.pieces[orig]
  state.lastMove = [orig, dest]
  state.check = null
  tryAutoCastle(state, orig, dest)
  setTimeout(state.events.change)
  return true
}

function baseNewPiece(state: State, piece: Piece, key: Key, force = false): boolean {
  if (state.pieces[key]) {
    if (force) delete state.pieces[key]
    else return false
  }
  setTimeout(() => {
    if (state.events.dropNewPiece) state.events.dropNewPiece(piece, key)
  })
  state.pieces[key] = piece
  state.lastMove = [key, key]
  state.check = null
  setTimeout(state.events.change)
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

function tryAutoCastle(state: State, orig: Key, dest: Key) {
  if (!state.autoCastle) return
  const king = state.pieces[dest]
  if (king.role !== 'king') return
  const origPos = util.key2pos(orig)
  if (origPos[0] !== 5) return
  if (origPos[1] !== 1 && origPos[1] !== 8) return
  const destPos = util.key2pos(dest)
  let oldRookPos, newRookPos, newKingPos
  if (destPos[0] === 7 || destPos[0] === 8) {
    oldRookPos = util.pos2key([8, origPos[1]])
    newRookPos = util.pos2key([6, origPos[1]])
    newKingPos = util.pos2key([7, origPos[1]])
  } else if (destPos[0] === 3 || destPos[0] === 1) {
    oldRookPos = util.pos2key([1, origPos[1]])
    newRookPos = util.pos2key([4, origPos[1]])
    newKingPos = util.pos2key([3, origPos[1]])
  } else return
  delete state.pieces[orig]
  delete state.pieces[dest]
  delete state.pieces[oldRookPos]
  state.pieces[newKingPos] = {
    role: 'king',
    color: king.color
  }
  state.pieces[newRookPos] = {
    role: 'rook',
    color: king.color
  }
}

