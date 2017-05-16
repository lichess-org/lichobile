import * as helper from '../../helper'
import socket from '../../../socket'
import layout from '../../layout'
import { header as headerWidget, backButton } from '../../shared/common'
import { renderBody } from './gamesView'
import { GameFilter } from '../../../lichess/interfaces/user'
import UserGamesCtrl, { IUserGamesCtrl } from './UserGamesCtrl'

interface Attrs {
  id: string
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
    const username = vnode.attrs.id

    const header = () => headerWidget(null, backButton(username + ' games'))

    return layout.free(header, () => renderBody(this.ctrl))
  }
}


export default UserGames
