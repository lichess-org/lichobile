/// <reference path="dts/index.d.ts" />
import { Capacitor, Plugins, AppState, DeviceInfo, NetworkStatus } from '@capacitor/core'
import debounce from 'lodash-es/debounce'
import { hasNetwork, requestIdleCallback } from './utils'
import redraw from './utils/redraw'
import session from './session'
import settings from './settings'
import { ensureLocaleIsAvailable, loadLanguage, getCurrentLocale } from './i18n'
import * as xhr from './xhr'
import challengesApi from './lichess/challenges'
import * as helper from './ui/helper'
import lobby from './ui/lobby'
import push from './push'
import router from './router'
import socket from './socket'
import sound from './sound'
import { isForeground, setForeground, setBackground } from './utils/appMode'

let firstConnection = true

export default function appInit(
  info: DeviceInfo,
  cpuCores: number,
  sfMaxMem: number,
  buildConfig: BuildConfig,
) {

  if (settings.analyse.cevalHashSize() === 0) {
    settings.analyse.cevalHashSize(sfMaxMem)
  }

  window.deviceInfo = {
    platform: info.platform,
    uuid: info.uuid,
    appVersion: info.appVersion,
    cpuCores,
    stockfishMaxMemory: Math.ceil(sfMaxMem / 16.0) * 16,
  }
  window.lichess.buildConfig = buildConfig

  if (Capacitor.platform === 'ios') {
    Plugins.Keyboard.setAccessoryBarVisible({ isVisible: true })
  }

  requestIdleCallback(() => {
    // cache viewport dims
    helper.viewportDim()
    sound.load(info)
  })

  // pull session data once (to log in user automatically thanks to cookie)
  // and also listen to online event in case network was disconnected at app
  // startup
  if (hasNetwork()) {
    onOnline()
  } else {
    session.restoreStoredSession()
  }

  Plugins.App.addListener('appStateChange', (state: AppState) => {
    if (state.isActive) {
      setForeground()
      session.refresh()
      getPools().then(() => redraw())
      socket.connect()
      redraw()
    }
    else {
      setBackground()
      lobby.appCancelSeeking()
      socket.disconnect()
    }
  })

  Plugins.Network.addListener('networkStatusChange', (s: NetworkStatus) => {
    if (s.connected) {
      onOnline()
    }
    else {
      onOffline()
    }
  })

  Plugins.App.addListener('backButton', router.backbutton)

  window.addEventListener('resize', debounce(onResize), false)
}

function onResize() {
  helper.clearCachedViewportDim()
  redraw()
}

function onOnline() {
  if (isForeground()) {
    if (firstConnection) {

      firstConnection = false

      xhr.status()

      getPools()

      session.rememberLogin()
      .then((user) => {
        const serverLocale = user.language
        if (serverLocale && getCurrentLocale() !== serverLocale) {
          console.debug('Locale from server differs from app: ', serverLocale)
          ensureLocaleIsAvailable(serverLocale)
          .then(loadLanguage)
        }
        push.register()
        challengesApi.refresh()
        if (Capacitor.platform === 'ios') {
          Plugins.Badge.setNumber({ badge: session.myTurnGames().length })
        }
        redraw()

      })
      .catch(() => {
        console.log('connected as anonymous')
        if (Capacitor.platform === 'ios') {
          Plugins.Badge.setNumber({ badge: 0 })
        }
      })

    } else {
      socket.connect()
      session.refresh()
    }
  }
}

function onOffline() {
  // TODO check this behavior with capacitor
  // offline event fires every time the network connection changes
  // it doesn't mean necessarily the network is off
  if (isForeground() && !hasNetwork()) {
    socket.disconnect()
    redraw()
  }
}

// pre fetch and cache available pools
// retry 5 times
let nbRetries = 1
function getPools() {
  return xhr.lobby()
  .then(redraw)
  .catch(() => {
    if (nbRetries <= 5) {
      nbRetries++
      setTimeout(getPools, nbRetries * 1000)
    }
  })
}
