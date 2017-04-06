import router from '../../router'
import settings from '../../settings'
import clockSettings from './clockSettings'
import clockSet from './clockSet'
import * as stream from 'mithril/stream'

import { ClockType, IChessClock, IStageClock } from './interfaces'

export interface IChessClockCtrl {
  hideStatusBar: () => void
  startStop: () => void
  clockSettingsCtrl: any
  clockObj: Mithril.Stream<IChessClock | IStageClock>
  reload: () => void
  goHome: () => void
  clockTap: (side: 'top' | 'bottom') => void
  clockType: Mithril.Stream<ClockType>
}

export default function ChessClockCtrl(): IChessClockCtrl {

  const clockType: Mithril.Stream<ClockType> = stream(settings.clock.clockType() as ClockType)
  const clockObj: Mithril.Stream<IChessClock> = stream(clockSet[clockType()]())

  function reload() {
    if (clockObj() && clockObj().isRunning() && !clockObj().flagged()) return
    clockType(settings.clock.clockType() as ClockType)
    clockObj(clockSet[clockType()]())
  }

  const clockSettingsCtrl = clockSettings.controller(reload, clockObj)

  function clockTap(side: 'top' | 'bottom') {
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
    window.StatusBar.hide()
  }

  window.StatusBar.hide()

  if (window.cordova.platformId === 'android') {
    window.AndroidFullScreen.immersiveMode()
  }
  window.plugins.insomnia.keepAwake()
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
