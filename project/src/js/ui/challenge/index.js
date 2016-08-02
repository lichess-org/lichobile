import oninit from './challengeCtrl';
import view from './challengeView';

export default {
  oninit,
  onremove() {
    clearTimeout(this.pingTimeoutId());
  },
  view
};
