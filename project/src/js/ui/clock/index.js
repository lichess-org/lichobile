import * as helper from '../helper';
import oninit from './clockCtrl';
import view from './clockView';

export default {
  oninit,
  oncreate: helper.viewFadeIn,
  onbeforeremove: helper.onPageLeave(
    helper.viewFadeOut,
    () => {
      window.StatusBar.show();
      if (window.cordova.platformId === 'android') {
        window.AndroidFullScreen.showSystemUI();
      }
    }
  ),
  onremove() {
    if (this.clockObj().clockInterval) {
      clearInterval(this.clockObj().clockInterval);
    }
    document.removeEventListener('resume', this.hideStatusBar);
    window.removeEventListener('resize', this.hideStatusBar);
  },
  view
};
