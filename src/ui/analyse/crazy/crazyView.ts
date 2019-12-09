import h from 'mithril/hyperscript'
import { oppositeColor } from '../../../utils'
import CrazyPocket from '../../shared/round/crazy/CrazyPocket'

import AnalyseCtrl from '../AnalyseCtrl'

export default function renderCrazy(ctrl: AnalyseCtrl) {

  if (!ctrl.node.crazyhouse) return null

  return h('div.analyse-crazyPockets', [
    renderPlayer(ctrl),
    renderOpponent(ctrl),
  ])
}

export function renderPlayer(ctrl: AnalyseCtrl) {
  const crazyData = ctrl.node.crazyhouse

  if (!crazyData) return null

  return h(CrazyPocket, {
    ctrl,
    crazyData,
    color: ctrl.orientation,
  })
}

export function renderOpponent(ctrl: AnalyseCtrl) {
  const crazyData = ctrl.node.crazyhouse

  if (!crazyData) return null

  return h(CrazyPocket, {
    ctrl,
    crazyData,
    color: oppositeColor(ctrl.orientation)
  })
}
