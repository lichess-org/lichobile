import redraw from '../../utils/redraw'
import sound from '../../sound'
import vibrate from '../../vibrate'
import { AnalyseDataWithTree } from '../../lichess/interfaces/analyse'

import AnalyseCtrl from './AnalyseCtrl'

export default function(ctrl: AnalyseCtrl) {
  return {
    analysisProgress: (data: AnalyseDataWithTree) => {

      ctrl.mergeAnalysisData(data)

      if (!ctrl.analysisProgress) {
        ctrl.analysisProgress = true
        redraw()
      }

      if (data.tree.eval) {
        ctrl.analysisProgress = false
        sound.dong()
        vibrate.quick()
        redraw()
      }
    }
  }
}
