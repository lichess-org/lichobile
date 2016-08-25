import helper from '../helper';
import oninit from './otbCtrl';
import view from './otbView';

export default {
  oninit,
  oncreate: helper.viewFadeIn,
  onbeforeremove: helper.onPageLeave(
    helper.viewFadeOut,
    () => window.plugins.insomnia.allowSleepAgain()
  ),
  onremove() {
    this.chessWorker.terminate();
  },
  view
};
