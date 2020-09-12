import { Capacitor } from '@capacitor/core'
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
  },

  oncreate: helper.viewFadeIn,

  onremove() {
    socket.destroy()
    this.ctrl.unload()
    signals.sessionRestored.remove(this.ctrl.loadOfflinePuzzle)
  },

  view() {
    const header = dropShadowHeader('lichess.org')

    return layout.free(
      header,
      body(this.ctrl),
      undefined,
      undefined,
      Capacitor.platform === 'ios' ? this.ctrl.onScroll : undefined,
    )
  }
} as Mithril.Component<Attrs, State>
