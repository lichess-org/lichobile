import oninit from './aiCtrl';
import view from './aiView';

export default {
  oninit,
  onremove() {
    if (this.chessWorker) this.chessWorker.terminate();
    this.engine.exit();
  },
  view
};
