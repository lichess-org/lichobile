import socket from '../../socket';
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
  onremove() {
    window.plugins.insomnia.allowSleepAgain();
    socket.destroy();
    if (this.round) {
      this.round.unload();
    }
  },
  view
};
