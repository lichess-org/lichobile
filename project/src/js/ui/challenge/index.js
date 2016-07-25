import oninit from './challengeCtrl';
import view from './challengeView';

export default {
  oninit,
  onremove() {
    clearTimeout(this.pingTimeoutId());
    window.plugins.insomnia.allowSleepAgain();
  },
  view
};
