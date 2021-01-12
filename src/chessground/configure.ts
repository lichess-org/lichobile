import * as cg from './interfaces'
import { State, makeDefaults } from './state'
import * as board from './board'
import fen from './fen'

export function initBoard(cfg: cg.InitConfig): State {
  const defaults = makeDefaults()

  configureBoard(defaults, cfg || {})

  return defaults
}

export function configureBoard(state: State, config: cg.InitConfig): void {

  if (!config) return

  // don't merge destinations. Just override.
  if (config.movable && config.movable.dests) state.movable.dests = null

  merge(state, config)

  // if a fen was provided, replace the pieces
  if (config.fen) {
    state.pieces = fen.read(config.fen)
  }

  if (Object.prototype.hasOwnProperty.call(config, 'check')) board.setCheck(state, config.check || false)
  if (Object.prototype.hasOwnProperty.call(config, 'lastMove') && !config.lastMove) state.lastMove = null

  // fix move/premove dests
  if (state.selected) board.setSelected(state, state.selected)

  // no need for such short animations
  if (!state.animation.duration || state.animation.duration < 100) {
    state.animation.enabled = false
  }

  setRookCastle(state)
}

export function setNewBoardState(d: State, config: cg.SetConfig): void {
  if (!config) return

  if (config.fen) {
    d.pieces = fen.read(config.fen)
  }

  if (config.orientation !== undefined) d.orientation = config.orientation
  if (config.turnColor !== undefined) d.turnColor = config.turnColor

  if (config.dests !== undefined) {
    d.movable.dests = config.dests
  }

  if (config.movableColor !== undefined) {
    d.movable.color = config.movableColor
  }

  // set check after setting turn color
  if (Object.prototype.hasOwnProperty.call(config, 'check')) board.setCheck(d, config.check || false)

  if (Object.prototype.hasOwnProperty.call(config, 'lastMove') && !config.lastMove) d.lastMove = null
  else if (config.lastMove) d.lastMove = config.lastMove

  // fix move/premove dests
  if (d.selected) {
    board.setSelected(d, d.selected)
  }

  setRookCastle(d)
}

function setRookCastle(state: State): void {
  if (!state.movable.rookCastle && state.movable.dests) {
    const rank = state.movable.color === 'white' ? 1 : 8,
    kingStartPos = 'e' + rank as Key,
    dests = state.movable.dests[kingStartPos],
    king = state.pieces.get(kingStartPos)

    if (!dests || !king || king.role !== 'king') return

    state.movable.dests[kingStartPos] = dests.filter(d =>
      !((d === 'a' + rank) && dests.indexOf('c' + rank as cg.Key) !== -1) &&
      !((d === 'h' + rank) && dests.indexOf('g' + rank as cg.Key) !== -1)
    )
  }
}

function merge(base: any, extend: any) {
  for (const key in extend) {
    if (isObject(base[key]) && isObject(extend[key])) merge(base[key], extend[key])
    else base[key] = extend[key]
  }
}

function isObject(o: any): boolean {
  return o && typeof o === 'object'
}
