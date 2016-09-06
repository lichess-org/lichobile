import * as helper from '../helper';
import ctrl from './editorCtrl';
import view from './editorView';

export default {
  oninit: ctrl,
  oncreate: helper.viewFadeIn,
  onbeforeremove: helper.onPageLeave(
    helper.viewFadeOut,
    () => window.plugins.insomnia.allowSleepAgain()
  ),
  view
};
