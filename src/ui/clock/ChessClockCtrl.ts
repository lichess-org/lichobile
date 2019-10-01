import { Plugins } from '@capacitor/core'
import router from '../../router'
import settings from '../../settings'
import clockSettings from './clockSettings'
import clockSet from './clockSet'
import * as stream from 'mithril/stream'

import { ClockType, IChessClock } from '../shared/clock/interfaces'

export interface IChessClockCtrl {
  hideStatusBar: () => void
  startStop: () => void
  clockSettingsCtrl: any
  clockObj: Mithril.Stream<IChessClock>
  reload: () => void
  goHome: () => void
  clockTap: (side: 'white' | 'black') => void
  clockType: Mithril.Stream<ClockType>
}

export default function ChessClockCtrl(): IChessClockCtrl {

  const clockType: Mithril.Stream<ClockType> = stream(settings.clock.clockType())
  const clockObj: Mithril.Stream<IChessClock> = stream(clockSet[clockType()]())

  function reload() {
    if (clockObj() && clockObj().isRunning() && !clockObj().flagged()) return
    clockType(settings.clock.clockType())
    clockObj(clockSet[clockType()]())
  }

  const clockSettingsCtrl = clockSettings.controller(reload, clockObj)

  function clockTap(side: 'white' | 'black') {
    clockObj().clockHit(side)
  }

  function startStop () {
    clockObj().startStop()
  }

  function goHome() {
    if (!clockObj().isRunning() || clockObj().flagged()) {
      router.set('/')
    }
  }

  function hideStatusBar() {
    Plugins.StatusBar.hide()
  }

  Plugins.StatusBar.hide()

  if (window.deviceInfo.platform === 'android') {
    window.AndroidFullScreen.immersiveMode()
  }
  document.addEventListener('resume', hideStatusBar)
  window.addEventListener('resize', hideStatusBar)

  return {
    hideStatusBar,
    startStop,
    clockSettingsCtrl,
    clockObj,
    reload,
    goHome,
    clockTap,
    clockType
  }
}
