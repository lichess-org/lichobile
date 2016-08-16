import oninit from './otbCtrl';
import view from './otbView';

export default {
  oninit,
  cleanup() {
    window.plugins.insomnia.allowSleepAgain();
  },
  onremove() {
    this.chessWorker.terminate();
  },
  view
};
