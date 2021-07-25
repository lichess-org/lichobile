import redraw from '../../../utils/redraw'
import { OnlineRoundInterface } from '.'
import { noop } from '~/chessground/util'
import promotion from '../offlineRound/promotion'

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

function cancel(ctrl: OnlineRoundInterface) {
  if (ctrl.promoting) ctrl.reloadGameData()
  ctrl.promoting = null
}

export default {

  start: start,

  view: (ctrl: OnlineRoundInterface) => promotion.view(ctrl, () => cancel(ctrl))
}
