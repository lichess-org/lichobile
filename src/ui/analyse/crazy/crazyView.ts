import * as h from 'mithril/hyperscript'
import { oppositeColor } from '../../../utils'
import CrazyPocket from '../../shared/round/crazy/CrazyPocket'

import AnalyseCtrl from '../AnalyseCtrl'

export default function renderCrazy(ctrl: AnalyseCtrl) {

  const crazyData = ctrl.node.crazyhouse

  if (!crazyData) return null

  return h('div.analyse-crazyPockets', {
    key: 'crazyPockets'
  }, [
    h(CrazyPocket, {
      ctrl,
      crazyData,
      color: ctrl.orientation
    }),
    h(CrazyPocket, {
      ctrl,
      crazyData,
      color: oppositeColor(ctrl.orientation)
    })
  ])
}
