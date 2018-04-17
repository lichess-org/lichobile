import socket from '../../socket'
import * as helper from '../helper'
import { header } from '../shared/common'
import layout from '../layout'

import StudyListCtrl from './StudyListCtrl'
import studyListView from './studyListView'

interface Attrs {
}

interface State {
  ctrl: StudyListCtrl
}

export default {
  oncreate: helper.viewFadeIn,

  oninit() {
    socket.createDefault()

    this.ctrl = new StudyListCtrl()
  },

  view() {
    const ctrl = this.ctrl

    return layout.free(header('Studies'), studyListView(ctrl))
  }

} as Mithril.Component<Attrs, State>

