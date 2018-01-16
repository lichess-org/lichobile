import * as helper from '../helper'
import { loadingBackbutton } from '../shared/common'
import UserCtrl, { IUserCtrl } from './UserCtrl'
import socket from '../../socket'
import * as view from './userView'
import layout from '../layout'

interface Attrs {
  id: string
}

interface State {
  user: IUserCtrl
}

const UserScreen: Mithril.Component<Attrs, State> = {
  oninit({ attrs }) {
    socket.createDefault()

    this.user = UserCtrl(attrs.id)
  },

  oncreate(vnode: Mithril.DOMNode) {
    if (this.user.isMe()) {
      helper.elFadeIn(vnode.dom as HTMLElement)
    } else {
      helper.pageSlideIn(vnode.dom as HTMLElement)
    }
  },

  view() {
    const user = this.user.user()

    if (user) {
      return layout.free(
        () => view.header(user, this.user),
        () => view.profile(user, this.user)
      )
    } else {
      return layout.free(
        () => loadingBackbutton(),
        () => null
      )
    }
  }
}

export default UserScreen
