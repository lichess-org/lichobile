import oninit from './playersCtrl';
import view from './playersView';

export default {
  oninit,
  onremove() {
    window.removeEventListener('native.keyboardshow', this.onKeyboardShow);
    window.removeEventListener('native.keyboardhide', this.onKeyboardHide);
  },
  view
};
