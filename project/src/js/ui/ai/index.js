import helper from '../helper';
import oninit from './aiCtrl';
import view from './aiView';

export default {
  oninit,
  oncreate: helper.viewFadeIn,
  onbeforeremove: helper.onPageLeave(
    helper.viewFadeOut,
    () => window.plugins.insomnia.allowSleepAgain()
  ),
  onremove() {
    this.chessWorker.terminate();
    this.engine.exit();
  },
  view
};
