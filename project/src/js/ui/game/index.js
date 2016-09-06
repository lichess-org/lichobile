import * as helper from '../helper';
import oninit from './oninit';
import view from './gameView';

export default {
  oninit,
  oncreate(vnode) {
    if (vnode.attrs.color) {
      helper.pageSlideIn(vnode.dom);
    } else {
      helper.elFadeIn(vnode.dom);
    }
  },
  onbeforeremove(vnode, done) {
    window.plugins.insomnia.allowSleepAgain();
    const p = vnode.attrs.color ?
      helper.elSlideOut(vnode.dom) :
      helper.elFadeOut(vnode.dom);
    p.then(done).catch(done);
  },
  onremove() {
    if (this.round) {
      this.round.unload();
    }
  },
  view
};
