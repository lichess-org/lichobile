import socket from '../../socket';
import * as helper from '../helper';
import oninit from './oninit';
import view from './view/analyseView';

interface Attrs {
  source: string
}

export default {
  oninit,
  oncreate(vnode: Mithril.Vnode<Attrs>) {
    if (vnode.attrs.source) {
      helper.pageSlideIn(vnode.dom);
    } else {
      helper.elFadeIn(vnode.dom);
    }
  },
  onremove() {
    window.plugins.insomnia.allowSleepAgain();
    socket.destroy();
    if (this.ctrl) {
      if (this.ctrl.ceval) this.ctrl.ceval.destroy();
      this.ctrl = null;
    }
  },
  view
};
