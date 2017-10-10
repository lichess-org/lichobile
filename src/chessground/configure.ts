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

  if (config.hasOwnProperty('check')) board.setCheck(state, config.check || false)
  if (config.hasOwnProperty('lastMove') && !config.lastMove) state.lastMove = null

  // fix move/premove dests
  if (state.selected) board.setSelected(state, state.selected)

  // no need for such short animations
  if (!state.animation.duration || state.animation.duration < 10)
    state.animation.enabled = false
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
  if (config.hasOwnProperty('check')) board.setCheck(d, config.check || false)

  if (config.hasOwnProperty('lastMove') && !config.lastMove) d.lastMove = null
  else if (config.lastMove) d.lastMove = config.lastMove

  // fix move/premove dests
  if (d.selected) {
    board.setSelected(d, d.selected)
  }
}

function merge(base: any, extend: any) {
  for (let key in extend) {
    if (isObject(base[key]) && isObject(extend[key])) merge(base[key], extend[key])
    else base[key] = extend[key]
  }
}

function isObject(o: any): boolean {
  return o && typeof o === 'object'
}
