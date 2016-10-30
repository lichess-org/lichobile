import * as helper from '../helper';
import oninit from './userCtrl';
import view from './userView';

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
