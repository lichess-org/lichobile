import Stream from 'mithril/stream'
import { Plugins, AppState, PluginListenerHandle } from '@capacitor/core'
import router from '../../router'
import settings from '../../settings'
import clockSettings from './clockSettings'
import clockSet from './clockSet'

import { ClockType, IChessClock } from '../shared/clock/interfaces'

export interface IChessClockCtrl {
  hideStatusBar: () => void
  startStop: () => void
  clockSettingsCtrl: any
  clockObj: Stream<IChessClock>
  reload: () => void
  goHome: () => void
  clockTap: (side: 'white' | 'black') => void
  clockType: Stream<ClockType>
  appStateListener: PluginListenerHandle
}

export default function ChessClockCtrl(): IChessClockCtrl {

  const clockType: Stream<ClockType> = Stream(settings.clock.clockType())
  const clockObj: Stream<IChessClock> = Stream(clockSet[clockType()]())

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

  hideStatusBar()

  if (window.deviceInfo.platform === 'android') {
    window.AndroidFullScreen.immersiveMode()
  }

  const appStateListener = Plugins.App.addListener('appStateChange', (state: AppState) => {
    if (state.isActive) hideStatusBar()
  })

  window.addEventListener('resize', hideStatusBar)

  return {
    hideStatusBar,
    startStop,
    clockSettingsCtrl,
    clockObj,
    reload,
    goHome,
    clockTap,
    clockType,
    appStateListener
  }
}
