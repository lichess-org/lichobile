import ctrl from './editorCtrl';
import view from './editorView';

export default {
  oninit: ctrl,
  onremove() {
    if (this.chessground) {
      this.chessground.onunload();
    }
  },
  view
};
