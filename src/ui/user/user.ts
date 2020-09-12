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
  ctrl: IUserCtrl
}

const UserScreen: Mithril.Component<Attrs, State> = {
  oninit({ attrs }) {
    socket.createDefault()

    this.ctrl = UserCtrl(attrs.id)
  },

  oncreate(vnode: Mithril.VnodeDOM<any, any>) {
    if (this.ctrl.isMe()) {
      helper.elFadeIn(vnode.dom as HTMLElement)
    } else {
      helper.pageSlideIn(vnode.dom as HTMLElement)
    }
  },

  view() {
    const user = this.ctrl.user()

    if (user) {
      return layout.free(
        view.header(user, this.ctrl),
        view.profile(user, this.ctrl)
      )
    } else {
      return layout.free(
        loadingBackbutton(),
        null
      )
    }
  }
}

export default UserScreen
