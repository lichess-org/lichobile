import oninit from './aiCtrl';
import view from './aiView';

export default {
  oninit,
  onremove() {
    if (this.chessground) {
      this.chessground.onunload();
    }
    if (this.chessWorker) this.chessWorker.terminate();
    this.engine.exit();
    window.plugins.insomnia.allowSleepAgain();
  },
  view
};
