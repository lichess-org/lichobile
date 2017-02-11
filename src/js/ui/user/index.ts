import * as helper from '../helper';
import userCtrl, { UserCtrl } from './userCtrl';
import socket from '../../socket';
import * as view from './userView';
import layout from '../layout';

interface Attrs {
  id: string
}

interface State {
  user: UserCtrl
}

const UserScreen: Mithril.Component<Attrs, State> = {
  oninit({ attrs }) {
    helper.analyticsTrackView('User Profile');
    socket.createDefault();

    this.user = userCtrl(attrs.id)
  },

  oncreate(vnode: Mithril.DOMNode) {
    if (this.user.isMe()) {
      helper.elFadeIn(vnode.dom as HTMLElement);
    } else {
      helper.pageSlideIn(vnode.dom as HTMLElement);
    }
  },

  view() {
    const user = this.user.user();

    if (!user) return layout.empty();

    return layout.free(
      () => view.header(user, this.user),
      () => view.profile(user, this.user)
    )
  }
}

export default UserScreen
