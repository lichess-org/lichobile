import * as helper from '../helper';
import oninit from './importerOninit';
import view from './importerView';

export default {
  oncreate: helper.viewFadeIn,
  oninit,
  onremove() {
    window.removeEventListener('native.keyboardshow', helper.onKeyboardShow);
    window.removeEventListener('native.keyboardhide', helper.onKeyboardHide);
  },
  view
};
