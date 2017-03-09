import * as helper from '../helper'
import oninit from './oninit'
import view from './clockView'

export default {
  oninit,
  oncreate: helper.viewFadeIn,
  onremove() {
    if (this.clockObj().clockInterval) {
      clearInterval(this.clockObj().clockInterval)
    }
    document.removeEventListener('resume', this.hideStatusBar)
    window.removeEventListener('resize', this.hideStatusBar)
    window.StatusBar.show()
    if (window.cordova.platformId === 'android') {
      window.AndroidFullScreen.showSystemUI()
    }
  },
  view
}
