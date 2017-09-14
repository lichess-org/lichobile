import redraw from '../../utils/redraw'
import evalSummary from './evalSummaryPopup'
import sound from '../../sound'
import vibrate from '../../vibrate'
import { AnalyseDataWithTree } from '../../lichess/interfaces/analyse'

import AnalyseCtrl from './AnalyseCtrl'

export default function(ctrl: AnalyseCtrl) {
  return {
    analysisProgress: (data: AnalyseDataWithTree) => {

      ctrl.mergeAnalysisData(data)

      if (!ctrl.menu.s.analysisProgress) {
        ctrl.menu.s.analysisProgress = true
        redraw()
      }

      if (data.tree.eval) {
        ctrl.menu.s.analysisProgress = false
        ctrl.evalSummary = ctrl.data.analysis ? evalSummary.controller(ctrl) : null
        sound.dong()
        vibrate.quick()
        redraw()
      }
    }
  }
}
