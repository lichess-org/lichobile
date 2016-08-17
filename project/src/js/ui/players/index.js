import helper from '../helper';
import oninit from './playersCtrl';
import view from './playersView';

export default {
  oninit,
  oncreate: helper.viewFadeIn,
  onbeforeremove: helper.viewFadeOut,
  onremove() {
    window.removeEventListener('native.keyboardshow', this.onKeyboardShow);
    window.removeEventListener('native.keyboardhide', this.onKeyboardHide);
  },
  view
};
