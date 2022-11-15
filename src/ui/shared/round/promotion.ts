import redraw from '../../../utils/redraw'
import { OnlineRoundInterface } from '.'
import promotion from '../offlineRound/promotion'

function start(ctrl: OnlineRoundInterface, orig: Key, dest: Key, isPremove: boolean) {
  if (promotion.canPromote(ctrl.chessground.state, dest)) {
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
