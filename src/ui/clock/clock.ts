import { Plugins } from '@capacitor/core'
import * as sleepUtils from '../../utils/sleep'
import * as helper from '../helper'
import layout from '../layout'

import ChessClockCtrl, { IChessClockCtrl } from './ChessClockCtrl'
import { clockBody, renderClockSettingsOverlay } from './clockView'

interface State {
  ctrl: IChessClockCtrl
}

const ChessClockScreen: Mithril.Component<{}, State> = {
  oncreate: helper.viewFadeIn,

  oninit() {
    sleepUtils.keepAwake()
    this.ctrl = ChessClockCtrl()
  },

  onremove() {
    const c = this.ctrl.clockObj()
    if (c !== undefined) {
      c.clear()
    }
    sleepUtils.allowSleepAgain()

    this.ctrl.appStateListener.remove()

    window.removeEventListener('resize', this.ctrl.hideStatusBar)

    Plugins.StatusBar.show()

    if (window.deviceInfo.platform === 'android') {
      window.AndroidFullScreen.showSystemUI()
    }
  },

  view() {
    const body = () => clockBody(this.ctrl)
    const clockSettingsOverlay = () => renderClockSettingsOverlay(this.ctrl)

    return layout.clock(body, clockSettingsOverlay)
  }
}

export default ChessClockScreen
