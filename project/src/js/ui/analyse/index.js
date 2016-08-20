import helper from '../helper';
import oninit from './analyseCtrl';
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
  onbeforeremove(vnode, done) {
    window.plugins.insomnia.allowSleepAgain();
    const p = vnode.attrs.source ?
      helper.elSlideOut(vnode.dom) :
      helper.elFadeOut(vnode.dom);
    p.then(done).catch(done);
  },
  onremove() {
    if (this.ceval) this.ceval.destroy();
    this.chessLogic.terminate();
    signals.seekCanceled.remove(this.connectGameSocket);
  },
  view
};
