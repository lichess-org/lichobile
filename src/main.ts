/// <reference path="dts/index.d.ts" />

'use strict'

// capacitor plugins registration
import 'capacitor-sound-effect'

import { Plugins, AppState, DeviceInfo, NetworkStatus } from '@capacitor/core'
import debounce from 'lodash-es/debounce'
import { hasNetwork } from './utils'
import { syncWithNowPlayingGames } from './utils/offlineGames'
import redraw from './utils/redraw'
import session from './session'
import settings from './settings'
import { loadPreferredLanguage, ensureLocaleIsAvailable, loadLanguage } from './i18n'
import * as xhr from './xhr'
import challengesApi from './lichess/challenges'
import * as helper from './ui/helper'
import lobby from './ui/lobby'
import router from './router'
import socket from './socket'
import routes from './routes'
import { isForeground, setForeground, setBackground } from './utils/appMode'
// import { loadCachedImages } from './bgtheme'

let firstConnection = true

function main(info: DeviceInfo) {

  window.deviceInfo = {
    platform: info.platform,
    uuid: info.uuid,
    appVersion: info.appVersion,
  }

  routes.init()
  // TODO
  // deepLinks.init()
  // push.init()

  // cached background images
  // TODO
  // loadCachedImages()

  // cache viewport dims
  helper.viewportDim()

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

  // TODO
  // probably not needed
  window.addEventListener('unload', () => {
    socket.destroy()
    socket.terminate()
  })

  window.addEventListener('resize', debounce(onResize), false)

  Plugins.SplashScreen.hide()
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
        console.log('Got locale from server: ', serverLocale)
        if (serverLocale) {
          ensureLocaleIsAvailable(serverLocale)
          .then(lang => {
            settings.general.lang(lang)
            loadLanguage(lang)
          })
        }
        // push.register()
        challengesApi.refresh()
        syncWithNowPlayingGames(session.nowPlaying())
        redraw()
      })
      .catch(() => {
        console.log('connected as anonymous')
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

loadPreferredLanguage()
.then(() => Plugins.Device.getInfo())
.then(main)
