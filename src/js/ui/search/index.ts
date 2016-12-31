import * as helper from '../helper';
import oninit from './searchCtrl';
import view from './searchView';

export default {
  oninit: oninit,
  oncreate(vnode) {
    if (vnode.state.isMe()) {
      helper.elFadeIn(vnode.dom);
    } else {
      helper.pageSlideIn(vnode.dom);
    }
  },
  view
};
