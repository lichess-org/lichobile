import socket from '../../../socket'
import TeamCtrl from './TeamCtrl'
import * as helper from '../../helper'
import layout from '../../layout'
import { header, body } from './teamView'

interface Attrs {
  id: string
}

interface State {
  ctrl: TeamCtrl
}

export default {
  oninit({ attrs }) {
    socket.createDefault()
    this.ctrl = new TeamCtrl(attrs.id)
  },

  oncreate: helper.viewFadeIn,

  view() {
    const ctrl = this.ctrl
    const headerCtrl = header(ctrl)
    const bodyCtrl = body(ctrl)

    return layout.free(headerCtrl, bodyCtrl, undefined)
  }
} as Mithril.Component<Attrs, State>
