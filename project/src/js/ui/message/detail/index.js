import oninit from './messageDetailCtrl';
import view from './messageDetailView';

export default {
  oninit,
  onremove() {
    clearInterval(this.clockInterval());
  },
  view
};
