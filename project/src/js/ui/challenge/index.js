import * as helper from '../helper';
import oninit from './challengeCtrl';
import view from './challengeView';

export default {
  oninit,
  oncreate: helper.viewFadeIn,
  onbeforeremove: helper.onPageLeave(
    helper.viewFadeOut,
    () => window.plugins.insomnia.allowSleepAgain()
  ),
  onremove() {
    clearTimeout(this.pingTimeoutId());
  },
  view
};
