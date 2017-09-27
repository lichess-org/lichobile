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
        ctrl.retroGlowing = true
        setTimeout(() => {
          ctrl.retroGlowing = false
          redraw()
        }, 1000 * 8)
        sound.dong()
        vibrate.quick()
        redraw()
      }
    }
  }
}
