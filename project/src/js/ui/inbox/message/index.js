import oninit from './messageCtrl';
import view from './messageView';

export default {
  oninit,
  onremove() {
    clearInterval(this.clockInterval());
  },
  view
};
