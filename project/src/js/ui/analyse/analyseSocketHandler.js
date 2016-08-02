import m from 'mithril';
import redraw from '../../utils/redraw';
import { handleXhrError } from '../../utils';
import { game as gameXhr } from '../../xhr';
import evalSummary from './evalSummaryPopup';
import sound from '../../sound';
import vibrate from '../../vibrate';
import analyse from './analyse';

export default function(ctrl, gameId, orientation) {
  return {
    analysisProgress: data => {
      if (!ctrl.vm.analysisProgress) {
        ctrl.vm.analysisProgress = true;
        redraw();
      }
      if (data.tree.eval) {
        ctrl.vm.analysisProgress = false;
        gameXhr(gameId, orientation, true).run(cfg => {
          cfg.orientation = orientation;
          ctrl.data = cfg;
          ctrl.analyse = new analyse(ctrl.data);
          ctrl.evalSummary = ctrl.data.analysis ? evalSummary.oninit(ctrl) : null;
          sound.dong();
          vibrate.quick();
          ctrl.jump(ctrl.vm.path);
          redraw();
        })
        .catch(err => {
          handleXhrError(err);
          redraw();
        });
      }
    }
  };
}
