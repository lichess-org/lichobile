import redraw from '../../utils/redraw'
import evalSummary from './evalSummaryPopup'
import sound from '../../sound'
import vibrate from '../../vibrate'

import AnalyseCtrl from './AnalyseCtrl'
import { AnalyseDataWithTree } from './interfaces'

export default function(ctrl: AnalyseCtrl) {
  return {
    analysisProgress: (data: AnalyseDataWithTree) => {

      ctrl.mergeAnalysisData(data)

      if (!ctrl.vm.analysisProgress) {
        ctrl.vm.analysisProgress = true
        redraw()
      }

      if (data.tree.eval) {
        ctrl.vm.analysisProgress = false
        ctrl.evalSummary = ctrl.data.analysis ? evalSummary.controller(ctrl) : null
        sound.dong()
        vibrate.quick()
        redraw()
      }
    }
  }
}
