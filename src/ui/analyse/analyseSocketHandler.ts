import { MessageHandlers } from '../../socket'
import { AnalyseDataWithTree } from '../../lichess/interfaces/analyse'
import { ops as treeOps } from '../shared/tree'

import { CloudEval } from './evalCache'
import AnalyseCtrl from './AnalyseCtrl'

export default function(ctrl: AnalyseCtrl): MessageHandlers {
  return {
    analysisProgress(data: AnalyseDataWithTree) {
      ctrl.mergeAnalysisData(data)
    },

    evalHit(data: CloudEval) {
      ctrl.evalCache.onCloudEval(data)
    },

    fen(e: { id: string, fen: string }) {
      if (ctrl.forecast &&
        e.id === ctrl.data.game.id &&
        treeOps.last(ctrl.mainline)!.fen.indexOf(e.fen) !== 0) {
        ctrl.forecast.reloadToLastPly()
      }
    },
  }
}
