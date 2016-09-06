import * as helper from '../helper';
import oninit from './homeCtrl';
import view from './homeView';

export default {
  oninit: oninit,
  oncreate: helper.viewFadeIn,
  onbeforeremove: helper.viewFadeOut,
  onremove() {
    document.removeEventListener('online', this.init);
    document.removeEventListener('resume', this.onResume);
  },
  view
};
