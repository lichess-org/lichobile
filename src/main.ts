/// <reference path="dts/index.d.ts" />

'use strict'

import 'whatwg-fetch'

import * as Raven from 'raven-js'
import * as moment from 'moment'
window.moment = moment

import * as debounce from 'lodash/debounce'
import globalConfig from './config'
import { hasNetwork } from './utils'
import { syncWithNowPlayingGames } from './utils/offlineGames'
import redraw from './utils/redraw'
import session from './session'
import { loadPreferredLanguage, getLang } from './i18n'
import * as xhr from './xhr'
import challengesApi from './lichess/challenges'
import * as helper from './ui/helper'
import lobby from './ui/lobby'
import router from './router'
import socket from './socket'
import push from './push'
import routes from './routes'
import deepLinks from './deepLinks'
import { isForeground, setForeground, setBackground } from './utils/appMode'
import { loadCachedImages } from './bgtheme'

let firstConnection = true

function main() {

  routes.init()
  deepLinks.init()

  // cached background images
  loadCachedImages()

  // cache viewport dims
  helper.viewportDim()

  // iOs needs this to auto-rotate
  window.shouldRotateToOrientation = () => {
    return true
  }

  // pull session data once (to log in user automatically thanks to cookie)
  // and also listen to online event in case network was disconnected at app
  // startup
  if (hasNetwork()) {
    onOnline()
  }

  window.cordova.plugins.notification.local.on('click', (notification: LocalNotification) => {
    try {
      const data = JSON.parse(notification.data)
      if (data && data.notifType === 'route') {
        router.set(data.route)
      }
    } catch (_) {}
  })

  document.addEventListener('online', onOnline, false)
  document.addEventListener('offline', onOffline, false)
  document.addEventListener('resume', onResume, false)
  document.addEventListener('pause', onPause, false)
  document.addEventListener('backbutton', router.backbutton, false)
  window.addEventListener('unload', () => {
    socket.destroy()
    socket.terminate()
  })
  window.addEventListener('resize', debounce(onResize), false)

  // iOs keyboard hack
  // TODO we may want to remove this and call only on purpose
  window.cordova.plugins.Keyboard.disableScroll(true)
  window.cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false)

  if (globalConfig.mode === 'release' && globalConfig.sentryDSN) {
    Raven.config(globalConfig.sentryDSN, {
      release: window.AppVersion ? window.AppVersion.version : 'snapshot-dev'
    }).install()
  }

  if (cordova.platformId === 'android') {
      window.StatusBar.backgroundColorByHexString('#151A1E')
  }

  setTimeout(() => {
    window.navigator.splashscreen.hide()
  }, 500)
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

      // pre fetch and cache available pools
      xhr.lobby()

      session.rememberLogin()
      .then(() => {
        push.register()
        challengesApi.refresh()
        redraw()
      })
      .then(session.nowPlaying)
      .then(syncWithNowPlayingGames)
      .then(() => xhr.setServerLang(getLang()))
      .catch(() => console.log('connected as anonymous'))

    } else {
      socket.connect()
      session.refresh()
    }
  }
}

function onOffline() {
  // offline event fires every time the network connection changes
  // it doesn't mean necessarily the network is off
  if (isForeground() && !hasNetwork()) {
    socket.disconnect()
    redraw()
  }
}

function onResume() {
  setForeground()
  socket.connect()
}

function onPause() {
  setBackground()
  lobby.appCancelSeeking()
  socket.disconnect()
}

document.addEventListener('deviceready',
  // i18n must be loaded before any rendering happens
  () => loadPreferredLanguage().then(main),
  false
)
