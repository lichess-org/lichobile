import oninit from './otbCtrl';
import view from './otbView';

export default {
  oninit,
  onremove() {
    if (this.chessground) {
      this.chessground.onunload();
    }
    this.chessWorker.terminate();
    window.plugins.insomnia.allowSleepAgain();
  },
  view
};
