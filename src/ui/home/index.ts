import socket from '../../socket'
import signals from '../../signals'
import { safeStringToNum } from '../../utils'
import * as helper from '../helper'
import layout from '../layout'
import { dropShadowHeader } from '../shared/common'

import HomeCtrl from './HomeCtrl'
import { body } from './homeView'

interface Attrs {
  tab?: string
}

interface State {
  ctrl: HomeCtrl
}

export default {
  oninit({ attrs }) {
    this.ctrl = new HomeCtrl(safeStringToNum(attrs.tab))

    signals.sessionRestored.add(this.ctrl.loadOfflinePuzzle)
    document.addEventListener('online', this.ctrl.init)
    document.addEventListener('resume', this.ctrl.onResume)
  },

  oncreate: helper.viewFadeIn,

  onremove() {
    socket.destroy()
    document.removeEventListener('online', this.ctrl.init)
    document.removeEventListener('resume', this.ctrl.onResume)
    signals.sessionRestored.remove(this.ctrl.loadOfflinePuzzle)
  },

  view() {
    const header = dropShadowHeader('lichess.org')

    return layout.free(header, body(this.ctrl))
  }
} as Mithril.Component<Attrs, State>
