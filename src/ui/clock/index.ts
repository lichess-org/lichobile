import * as helper from '../helper'
import ChessClockCtrl, { IChessClockCtrl } from './ChessClockCtrl'
import layout from '../layout'
import { clockBody, renderClockSettingsOverlay } from './clockView'

interface State {
  ctrl: IChessClockCtrl
}

const ChessClockScreen: Mithril.Component<{}, State> = {
  oncreate: helper.viewFadeIn,

  oninit() {
    this.ctrl = ChessClockCtrl()
  },

  onremove() {
    const c = this.ctrl.clockObj()
    if (c !== undefined) {
      c.clear()
    }
    document.removeEventListener('resume', this.ctrl.hideStatusBar)
    window.removeEventListener('resize', this.ctrl.hideStatusBar)
    window.StatusBar.show()
    if (window.cordova.platformId === 'android') {
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
