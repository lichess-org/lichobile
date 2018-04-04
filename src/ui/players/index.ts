import socket from '../../socket'
import * as helper from '../helper'
import layout from '../layout'
import PlayersCtrl, { IPlayersCtrl } from './PlayersCtrl'
import { header, body, searchModal } from './playersView'

interface State {
  ctrl: IPlayersCtrl
}

export default {
  oninit() {
    socket.createDefault()

    this.ctrl = PlayersCtrl()
  },

  oncreate: helper.viewFadeIn,

  onremove() {
    this.ctrl.unload()
  },

  view() {
    const ctrl = this.ctrl
    const headerCtrl = header(ctrl)
    const bodyCtrl = body(ctrl)
    const searchModalCtrl = searchModal(ctrl)

    return layout.free(headerCtrl, bodyCtrl, undefined, searchModalCtrl)
  }
} as Mithril.Component<{}, State>
