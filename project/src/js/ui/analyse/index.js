import oninit from './analyseCtrl';
import view from './view/analyseView';
import signals from '../../signals';

export default {
  oninit,
  cleanup() {
    window.plugins.insomnia.allowSleepAgain();
  },
  onremove() {
    if (this.ceval) this.ceval.destroy();
    this.chessLogic.onunload();
    signals.seekCanceled.remove(this.connectGameSocket);
  },
  view
};
