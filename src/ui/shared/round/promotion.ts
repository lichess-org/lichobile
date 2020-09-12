import h from 'mithril/hyperscript'
import redraw from '../../../utils/redraw'
import settings from '../../../settings'
import * as helper from '../../helper'
import { OnlineRoundInterface } from '.'

let promoting: KeyPair | null = null

function start(ctrl: OnlineRoundInterface, orig: Key, dest: Key, isPremove: boolean) {
  const piece = ctrl.chessground.state.pieces.get(dest)
  if (piece && piece.role === 'pawn' && (
    (dest[1] === '8' && ctrl.data.player.color === 'white') ||
    (dest[1] === '1' && ctrl.data.player.color === 'black'))) {
    if (ctrl.data.pref.autoQueen === 3 || (ctrl.data.pref.autoQueen === 2 && isPremove)) return false
    promoting = [orig, dest]
    redraw()
    return true
  }
  return false
}

function finish(ctrl: OnlineRoundInterface, role: Role) {
  if (promoting) {
    ctrl.chessground.promote(promoting[1], role)
    ctrl.sendMove(promoting[0], promoting[1], role)
  }
  promoting = null
}

function cancel(ctrl: OnlineRoundInterface) {
  if (promoting) ctrl.reloadGameData()
  promoting = null
}

export default {

  start: start,

  view: function(ctrl: OnlineRoundInterface) {
    if (!promoting) return null

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
