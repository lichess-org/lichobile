import oninit from './trainingCtrl';
import view from './trainingView';

export default {
  oninit,
  onremove() {
    if (this.chessground) {
      this.chessground.onunload();
    }
    window.plugins.insomnia.allowSleepAgain();
  },
  view
};
