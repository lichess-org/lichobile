import * as helper from '../helper';
import oninit from './oninit';
import view from './view/analyseView';
import signals from '../../signals';

export default {
  oninit,
  oncreate(vnode) {
    if (vnode.attrs.source) {
      helper.pageSlideIn(vnode.dom);
    } else {
      helper.elFadeIn(vnode.dom);
    }
  },
  onremove() {
    window.plugins.insomnia.allowSleepAgain();
    if (this.ctrl.ceval) this.ctrl.ceval.destroy();
    this.ctrl.chessLogic.terminate();
    signals.seekCanceled.remove(this.ctrl.connectGameSocket);
  },
  view
};
