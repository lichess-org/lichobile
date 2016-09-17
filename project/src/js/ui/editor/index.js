import * as helper from '../helper';
import ctrl from './editorCtrl';
import view from './editorView';

export default {
  oninit: ctrl,
  oncreate: helper.viewFadeIn,
  onremove() {
    window.plugins.insomnia.allowSleepAgain();
  },
  view
};
