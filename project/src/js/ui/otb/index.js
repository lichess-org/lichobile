import oninit from './otbCtrl';
import view from './otbView';

export default {
  oninit,
  onremove() {
    this.chessWorker.terminate();
  },
  view
};
