import oninit from './aiCtrl';
import view from './aiView';

export default {
  oninit,
  onremove() {
    this.chessWorker.terminate();
    this.engine.exit();
  },
  view
};
