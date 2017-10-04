import router from '../../router'
import settings from '../../settings'
import clockSettings from './clockSettings'
import clockSet from './clockSet'
import * as stream from 'mithril/stream'

import { ClockType, IChessClock, IStageClock } from '../shared/clock/interfaces'

export interface IChessClockCtrl {
  hideStatusBar: () => void
  startSwhite: () => void
  clockSettingsCtrl: any
  clockObj: Mithril.Stream<IChessClock | IStageClock>
  reload: () => void
  goHome: () => void
  clockTap: (side: 'white' | 'black') => void
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

  function clockTap(side: 'white' | 'black') {
    clockObj().clockHit(side)
  }

  function startSwhite () {
    clockObj().startSwhite()
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
    startSwhite,
    clockSettingsCtrl,
    clockObj,
    reload,
    goHome,
    clockTap,
    clockType
  }
}
