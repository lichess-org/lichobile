import socket from '../../socket'
import * as helper from '../helper'
import layout from '../layout'
import { safeStringToNum } from '../../utils'
import TeamsCtrl from './TeamsListCtrl'
import { header, body, searchModal } from './teamsListView'

interface Attrs {
  tab?: string
}

interface State {
  ctrl: TeamsCtrl
}

export default {
  oninit({ attrs }) {
    socket.createDefault()
    this.ctrl = new TeamsCtrl(safeStringToNum(attrs.tab))
  },

  oncreate: helper.viewFadeIn,

  view() {
    const ctrl = this.ctrl
    const headerCtrl = header(ctrl)
    const bodyCtrl = body(ctrl)
    const searchModalCtrl = searchModal(ctrl)

    return layout.free(headerCtrl, bodyCtrl, undefined, searchModalCtrl)
  }
} as Mithril.Component<Attrs, State>
