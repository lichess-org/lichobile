import oninit from './analyseCtrl';
import view from './view/analyseView';
import signals from '../../signals';

export default {
  oninit,
  onremove() {
    if (this.ceval) this.ceval.destroy();
    if (this.chessLogic) this.chessLogic.onunload();
    signals.seekCanceled.remove(this.connectGameSocket);
  },
  view
};
