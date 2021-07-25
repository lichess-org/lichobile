import redraw from '../../../utils/redraw'
import * as cg from '../../../chessground/interfaces'
import * as helper from '../../helper'
import settings from '../../../settings'
import h from 'mithril/hyperscript'
import { PromotingInterface } from '../round'

type PromoteCallback = (orig: Key, dest: Key, prom: Role) => void
export interface Promoting {
  orig: Key
  dest: Key
  callback: PromoteCallback
}

function start(ctrl: PromotingInterface, orig: Key, dest: Key, callback: PromoteCallback) {
  const piece = ctrl.chessground.state.pieces.get(dest)
  if (piece && piece.role === 'pawn' && (
    (dest[1] === '1' && ctrl.chessground.state.turnColor === 'white') ||
    (dest[1] === '8' && ctrl.chessground.state.turnColor === 'black'))) {
    ctrl.promoting = {
      orig: orig,
      dest: dest,
      callback: callback
    }
    redraw()
    return true
  }
  return false
}

function finish(ctrl: PromotingInterface, role: Role) {
  const promoting = ctrl.promoting
  if (promoting) {
    ctrl.chessground.promote(promoting.dest, role)
    promoting.callback(promoting.orig, promoting.dest, role)
  }
  ctrl.promoting = null
}

function cancel(ctrl: PromotingInterface, cgConfig?: cg.SetConfig) {
  if (ctrl.promoting) {
    ctrl.promoting = null
    if (cgConfig) ctrl.chessground.set(cgConfig)
    redraw()
  }
}

export function view<T extends PromotingInterface>(ctrl: T, cancelCallback: (ctrl: T) => void = cancel) {
  if (!ctrl.promoting) return null

  const pieces: Role[] = ['queen', 'knight', 'rook', 'bishop']
  if (ctrl.data && ctrl.data.game.variant.key === 'antichess') {
    pieces.push('king')
  }

  return h('div.overlay.open', {
    oncreate: helper.ontap(() => cancelCallback(ctrl))
  }, [h('div#promotion_choice', {
    className: settings.general.theme.piece(),
    style: { top: (helper.viewportDim().vh - 100) / 2 + 'px' }
  }, pieces.map((role: Role) => {
    return h('piece.' + role + '.' + ctrl.player(), {
      oncreate: helper.ontap(() => finish(ctrl, role))
    })
  }))])
}

export default {
  start,
  cancel,
  finish,
  view
}
