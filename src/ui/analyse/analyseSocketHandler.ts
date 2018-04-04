import { AnalyseDataWithTree } from '../../lichess/interfaces/analyse'

import { CloudEval } from './evalCache'
import AnalyseCtrl from './AnalyseCtrl'

export default function(ctrl: AnalyseCtrl) {
  return {
    analysisProgress(data: AnalyseDataWithTree) {
      ctrl.mergeAnalysisData(data)
    },

    evalHit(data: CloudEval) {
      ctrl.evalCache.onCloudEval(data)
    }
  }
}
