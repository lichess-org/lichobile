import redraw from '../../utils/redraw'
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
        sound.dong()
        vibrate.quick()
        redraw()
      }
    }
  }
}
