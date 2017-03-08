import redraw from '../../utils/redraw';
import { game as gameXhr } from '../../xhr';
import evalSummary from './evalSummaryPopup';
import sound from '../../sound';
import vibrate from '../../vibrate';
import Analyse from './Analyse';

import AnalyseCtrl from './AnalyseCtrl'

interface ProgressEval {
  tree: {
    eval?: any
  }
}

export default function(ctrl: AnalyseCtrl, gameId: string, orientation: Color) {
  return {
    analysisProgress: (data: ProgressEval) => {
      if (!ctrl.vm.analysisProgress) {
        ctrl.vm.analysisProgress = true;
        redraw();
      }
      if (data.tree.eval) {
        ctrl.vm.analysisProgress = false;
        gameXhr(gameId, orientation).then(cfg => {
          ctrl.data = cfg;
          ctrl.analyse = new Analyse(ctrl.data);
          ctrl.evalSummary = ctrl.data.analysis ? evalSummary.controller(ctrl) : null;
          sound.dong();
          vibrate.quick();
          ctrl.jump(ctrl.vm.path);
          redraw();
        })
        .catch(() => {
          redraw();
        });
      }
    }
  };
}
