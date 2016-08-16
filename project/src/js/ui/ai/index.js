import oninit from './aiCtrl';
import view from './aiView';

export default {
  oninit,
  cleanup() {
    window.plugins.insomnia.allowSleepAgain();
  },
  onremove() {
    this.chessWorker.terminate();
    this.engine.exit();
  },
  view
};
