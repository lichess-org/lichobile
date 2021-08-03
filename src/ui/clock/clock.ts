import { StatusBar } from '@capacitor/status-bar'
import * as sleepUtils from '../../utils/sleep'
import * as helper from '../helper'
import layout from '../layout'

import ChessClockCtrl, { IChessClockCtrl } from './ChessClockCtrl'
import { clockBody, renderClockSettingsOverlay } from './clockView'

interface State {
  ctrl: IChessClockCtrl
}


const ChessClockScreen: Mithril.Component<Record<string, never>, State> = {
  oncreate: helper.viewFadeIn,

  oninit() {
    sleepUtils.keepAwake()

    // TODO find capacitor alternative
    // if (window.deviceInfo.platform === 'android') {
    //   window.AndroidFullScreen.immersiveMode()
    // }

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

    StatusBar.show()

    // if (window.deviceInfo.platform === 'android') {
    //   window.AndroidFullScreen.showSystemUI()
    // }
  },

  view() {
    const body = () => clockBody(this.ctrl)
    const clockSettingsOverlay = () => renderClockSettingsOverlay(this.ctrl)

    return layout.clock(body, clockSettingsOverlay)
  }
}

export default ChessClockScreen
