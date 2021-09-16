import redraw from '../../../utils/redraw'
import { OnlineRoundInterface } from '.'
import promotion from '../offlineRound/promotion'

function start(ctrl: OnlineRoundInterface, orig: Key, dest: Key, isPremove: boolean) {
  const piece = ctrl.chessground.state.pieces.get(dest)
  if (piece && piece.role === 'pawn' && (
    (dest[1] === '8' && ctrl.player() === 'white') ||
    (dest[1] === '1' && ctrl.player() === 'black'))) {
    if (ctrl.data.pref.autoQueen === 3 || (ctrl.data.pref.autoQueen === 2 && isPremove)) return false
    ctrl.promoting = {
      orig, dest,
      callback: (orig, dest, role) => ctrl.sendMove(orig, dest, role)
    }
    redraw()
    return true
  }
  return false
}

function cancel(ctrl: OnlineRoundInterface) {
  if (ctrl.promoting) ctrl.reloadGameData()
  ctrl.promoting = null
}

export default {

  start: start,

  view: (ctrl: OnlineRoundInterface) => promotion.view(ctrl, cancel)
}
