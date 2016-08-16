import ctrl from './editorCtrl';
import view from './editorView';

export default {
  oninit: ctrl,
  cleanup() {
    window.plugins.insomnia.allowSleepAgain();
  },
  view
};
