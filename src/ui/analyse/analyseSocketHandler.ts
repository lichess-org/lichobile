import { AnalyseDataWithTree } from '../../lichess/interfaces/analyse'

import AnalyseCtrl from './AnalyseCtrl'

export default function(ctrl: AnalyseCtrl) {
  return {
    analysisProgress: (data: AnalyseDataWithTree) => {
      ctrl.mergeAnalysisData(data)
    }
  }
}
