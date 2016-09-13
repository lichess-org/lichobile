import * as helper from '../helper';
import oninit from './challengeCtrl';
import view from './challengeView';

export default {
  oninit,
  oncreate: helper.viewFadeIn,
  onremove() {
    window.plugins.insomnia.allowSleepAgain();
    clearTimeout(this.pingTimeoutId());
  },
  view
};
