import oninit from './analyseCtrl';
import view from './view/analyseView';
import signals from '../../signals';

export default {
  oninit,
  onremove() {
    if (this.chessground) {
      this.chessground.onunload();
      this.chessground = null;
    }
    if (this.ceval) this.ceval.destroy();
    if (this.chessLogic) this.chessLogic.onunload();
    window.plugins.insomnia.allowSleepAgain();
    signals.seekCanceled.remove(this.connectGameSocket);
  },
  view
};
