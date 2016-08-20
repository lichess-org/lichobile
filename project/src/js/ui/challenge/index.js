import helper from '../helper';
import oninit from './challengeCtrl';
import view from './challengeView';

export default {
  oninit,
  oncreate: helper.viewFadeIn,
  onbeforeremove: helper.viewFadeOut,
  onremove() {
    clearTimeout(this.pingTimeoutId());
  },
  view
};
