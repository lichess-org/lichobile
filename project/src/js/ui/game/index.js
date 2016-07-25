import oninit from './gameCtrl';
import view from './gameView';

export default {
  oninit,
  onremove() {
    if (this.round) {
      this.round.onunload();
      this.round = null;
    }
  },
  view
};
