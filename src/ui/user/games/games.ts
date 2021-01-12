import * as helper from '../../helper'
import socket from '../../../socket'
import layout from '../../layout'
import { header as headerWidget, backButton } from '../../shared/common'
import { renderBody } from './gamesView'
import { GameFilter } from '../../../lichess/interfaces/user'
import UserGamesCtrl, { IUserGamesCtrl } from './UserGamesCtrl'
import { userTitle } from '../userView'

interface Attrs {
  id: string
  title?: string
  username?: string
  patron?: string
  filter?: GameFilter
}

export interface State {
  ctrl: IUserGamesCtrl
}

const UserGames: Mithril.Component<Attrs, State> = {
  oncreate: helper.viewSlideIn,

  oninit(vnode) {
    socket.createDefault()

    this.ctrl = UserGamesCtrl(vnode.attrs.id, vnode.attrs.filter)
  },

  view(vnode) {
    const { id, username, title, patron } = vnode.attrs

    const user = this.ctrl.scrollState.user
    const displayedTitle = user ?
      userTitle(user.online!, user.patron!, user.username, user.title) :
      userTitle(false, Boolean(patron), username || id, title)

    const header = headerWidget(null, backButton(displayedTitle))

    return layout.free(header, renderBody(this.ctrl))
  }
}


export default UserGames
