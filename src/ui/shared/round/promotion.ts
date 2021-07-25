import h from 'mithril/hyperscript'
import redraw from '../../../utils/redraw'
import settings from '../../../settings'
import * as helper from '../../helper'
import { OnlineRoundInterface } from '.'
import { noop } from '~/chessground/util'

function start(ctrl: OnlineRoundInterface, orig: Key, dest: Key, isPremove: boolean) {
  const piece = ctrl.chessground.state.pieces.get(dest)
  if (piece && piece.role === 'pawn' && (
    (dest[1] === '8' && ctrl.chessground.state.turnColor === 'white') ||
    (dest[1] === '1' && ctrl.chessground.state.turnColor === 'black'))) {
    if (ctrl.data.pref.autoQueen === 3 || (ctrl.data.pref.autoQueen === 2 && isPremove)) return false
    ctrl.promoting = {
      orig, dest,
      callback: noop
    }
    redraw()
    return true
  }
  return false
}

function finish(ctrl: OnlineRoundInterface, role: Role) {
  const promoting = ctrl.promoting
  if (promoting) {
    ctrl.chessground.promote(promoting.dest, role)
    ctrl.sendMove(promoting.orig, promoting.dest, role)
  }
  ctrl.promoting = null
}

function cancel(ctrl: OnlineRoundInterface) {
  if (ctrl.promoting) ctrl.reloadGameData()
  ctrl.promoting = null
}

export default {

  start: start,

  view: function(ctrl: OnlineRoundInterface) {
    if (!ctrl.promoting) return null

    const pieces: Role[] = ['queen', 'knight', 'rook', 'bishop']

    if (ctrl.data.game.variant.key === 'antichess') pieces.push('king')

    return h('div.overlay.open', {
      oncreate: helper.ontap(() => cancel(ctrl))
    }, [h('div#promotion_choice', {
      className: settings.general.theme.piece(),
      style: { top: (helper.viewportDim().vh - 100) / 2 + 'px' }
    }, pieces.map((role) => {
      return h('piece.' + role + '.' + ctrl.data.player.color, {
        oncreate: helper.ontap(() => finish(ctrl, role))
      })
    }))])
  }
}
