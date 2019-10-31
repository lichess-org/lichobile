/// <reference path="dts/index.d.ts" />
import { Plugins, AppState, DeviceInfo, NetworkStatus } from '@capacitor/core'
import debounce from 'lodash-es/debounce'
import { hasNetwork } from './utils'
import { syncWithNowPlayingGames } from './utils/offlineGames'
import redraw from './utils/redraw'
import session, { Session } from './session'
import { fetchJSON } from './http'
import { ensureLocaleIsAvailable, loadLanguage, getCurrentLocale } from './i18n'
import * as xhr from './xhr'
import challengesApi from './lichess/challenges'
import * as helper from './ui/helper'
import lobby from './ui/lobby'
import push from './push'
import router from './router'
import sound from './sound'
import socket from './socket'
import routes from './routes'
import { isForeground, setForeground, setBackground } from './utils/appMode'

let firstConnection = true
const requestIdleCallback: (c: () => void) => void =
  window.requestIdleCallback || window.setTimeout

export default function appInit(info: DeviceInfo) {

  window.deviceInfo = {
    platform: info.platform,
    uuid: info.uuid,
    appVersion: info.appVersion,
  }

  routes.init()

  // TODO
  // deepLinks.init()
  push.init()

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
        // push.register()
        challengesApi.refresh()
        syncWithNowPlayingGames(session.nowPlaying())
        redraw()

        // TODO remove in next version (from 7.0.0)
        // localForage has been removed, we only want to sync unsolved puzzle if any
        requestIdleCallback(() => syncSolvedPuzzlesInOldStorage(user))
        // end of to remove part
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

function syncSolvedPuzzlesInOldStorage(user: Session) {
  const req = window.indexedDB.open('AppStore')
  req.onsuccess = () => {
    const db = req.result
    const store = db.transaction('keyvaluepairs', 'readonly').objectStore('keyvaluepairs')
    const allreq = store.getAllKeys()
    allreq.onsuccess = () => {
      allreq.result.forEach(k => {
        if ((typeof k === 'string') && k.startsWith('offlinePuzzles')) {
          const userId = k.split('.')[1]
          if (userId === user.id) {
            const req = store.get(k)
            req.onsuccess = () => {
              if (req.result && req.result.solved.lenght) {
                console.log('Old storage puzzles found for user', userId, req.result)
                fetchJSON(`/training/batch`, {
                  method: 'POST',
                  body: JSON.stringify({
                    solutions: req.result.solved
                  })
                })
              }
            }
          }
        }
      })
    }
  }
}
