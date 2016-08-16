import oninit from './gameCtrl';
import view from './gameView';

export default {
  oninit,
  cleanup() {
    window.plugins.insomnia.allowSleepAgain();
  },
  onremove() {
    if (this.round) {
      this.round.onunload();
    }
  },
  view
};
