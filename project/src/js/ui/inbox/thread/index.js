import oninit from './threadCtrl';
import view from './threadView';

export default {
  oninit,
  onremove() {
    clearInterval(this.clockInterval());
  },
  view
};
