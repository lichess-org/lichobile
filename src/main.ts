/// <reference path="dts/index.d.ts" />

'use strict'

import 'core-js/fn/symbol'
import 'core-js/fn/set'
import 'core-js/fn/map'
import 'whatwg-fetch'

import './moment'

import * as Raven from 'raven-js'
import * as debounce from 'lodash/debounce'
import globalConfig from './config'
import { hasNetwork } from './utils'
import { syncWithNowPlayingGames } from './utils/offlineGames'
import redraw from './utils/redraw'
import session from './session'
import settings from './settings'
import { loadPreferredLanguage, ensureLangIsAvailable, loadLanguage } from './i18n'
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
  } else {
    session.restoreStoredSession()
  }

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
      window.StatusBar.backgroundColorByHexString('#111')
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

      getPools()

      session.rememberLogin()
      .then((user) => {
        const serverLang = user.language && user.language.split('-')[0]
        if (serverLang) {
          ensureLangIsAvailable(serverLang)
          .then(lang => {
            settings.general.lang(lang)
            loadLanguage(lang)
          })
        }
        push.register()
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

// pre fetch and cache available pools
// retry 5 times
let nbRetries = 1
function getPools() {
  xhr.lobby()
  .then(() => {
    if (nbRetries > 1) redraw()
  })
  .catch(() => {
    if (nbRetries <= 5) {
      nbRetries++
      setTimeout(getPools, nbRetries * 1000)
    }
  })
}

document.addEventListener('deviceready',
  // i18n must be loaded before any rendering happens
  () => loadPreferredLanguage().then(main),
  false
)
