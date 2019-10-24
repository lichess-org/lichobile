import { Plugins, AppState, NetworkStatus, PluginListenerHandle } from '@capacitor/core'
import uniqBy from 'lodash-es/uniqBy'
import Zanimo from '../../utils/zanimo'
import socket, { SocketIFace } from '../../socket'
import redraw from '../../utils/redraw'
import signals from '../../signals'
import settings from '../../settings'
import { timeline as timelineXhr, seeks as corresSeeksXhr, lobby as lobbyXhr } from '../../xhr'
import { hasNetwork, noop } from '../../utils'
import { fromNow } from '../../i18n'
import { isForeground } from '../../utils/appMode'
import { PongMessage, TimelineEntry, DailyPuzzle, CorrespondenceSeek } from '../../lichess/interfaces'
import { TournamentListItem } from '../../lichess/interfaces/tournament'
import { PuzzleData } from '../../lichess/interfaces/training'
import session from '../../session'
import { supportedTypes as supportedTimelineTypes } from '../timeline'
import offlinePuzzleDB from '../training/database'
import { loadNewPuzzle } from '../training/offlineService'

import { dailyPuzzle as dailyPuzzleXhr, featuredTournaments as featuredTournamentsXhr } from './homeXhr'


export default class HomeCtrl {
  public selectedTab: number

  public socketIface?: SocketIFace

  public corresPool: ReadonlyArray<CorrespondenceSeek>
  public dailyPuzzle?: DailyPuzzle
  public featuredTournaments?: ReadonlyArray<TournamentListItem>
  public timeline?: ReadonlyArray<TimelineEntry>
  public offlinePuzzle?: PuzzleData | undefined

  private networkListener: PluginListenerHandle
  private appStateListener: PluginListenerHandle

  constructor(defaultTab?: number) {
    this.corresPool = []
    this.selectedTab = defaultTab || 0

    if (hasNetwork()) {
      this.init()
    } else {
      this.loadOfflinePuzzle()
    }

    this.networkListener = Plugins.Network.addListener('networkStatusChange', (s: NetworkStatus) => {
      if (s.connected) this.init()
    })

    this.appStateListener = Plugins.App.addListener('appStateChange', (state: AppState) => {
      if (state.isActive) this.init()
    })
  }

  public socketSend = <D>(t: string, d: D): void => {
    if (this.socketIface) this.socketIface.send(t, d)
  }

  public unload = () => {
    this.networkListener.remove()
    this.appStateListener.remove()
  }

  public init = () => {
    if (isForeground()) {
      this.socketIface = socket.createLobby('homeLobby', this.reloadCorresPool, {
        redirect: socket.redirectToGame,
        reload_seeks: this.reloadCorresPool,
        resync: () => lobbyXhr().then(d => {
          socket.setVersion(d.lobby.version)
        }),
        n: (_: never, d: PongMessage) => {
          signals.homePong.dispatch(d)
        }
      })

      Promise.all([
        dailyPuzzleXhr(),
        featuredTournamentsXhr()
      ])
      .then(results => {
        const [dailyData, featuredTournamentsData] = results
        this.dailyPuzzle = dailyData.puzzle
        this.featuredTournaments = featuredTournamentsData.featured
        redraw()
      })
      .catch(noop)

      timelineXhr()
      .then(data => {
        this.timeline = data.entries
          .filter((o: TimelineEntry) => supportedTimelineTypes.indexOf(o.type) !== -1)
          .slice(0, 10)
          .map(o => {
            o.fromNow = fromNow(new Date(o.date))
            return o
          })
        redraw()
      })
      .catch(noop)
    }
  }

  public loadOfflinePuzzle = () => {
    const user = session.get()
    if (user) {
      loadNewPuzzle(offlinePuzzleDB, user)
      .then(data => {
        this.offlinePuzzle = data
        redraw()
      })
    }
  }

  public onTabChange = (i: number) => {
    const loc = window.location.search.replace(/\?tab\=\w+$/, '')
    try {
      window.history.replaceState(window.history.state, '', loc + '?tab=' + i)
    } catch (e) { console.error(e) }
    this.selectedTab = i
    redraw()
  }

  public cancelCorresSeek = (seekId: string) => {
    const el = document.getElementById(seekId)
    if (el) {
      Zanimo(el, 'opacity', '0', 300, 'ease-out')
      .then(() => this.socketSend('cancelSeek', seekId))
      .catch(console.log.bind(console))
    }
  }

  public joinCorresSeek = (seekId: string) => {
    this.socketSend('joinSeek', seekId)
  }

  private reloadCorresPool = () => {
    corresSeeksXhr(false)
    .then(d => {
      this.corresPool = fixSeeks(d).filter(s => settings.game.supportedVariants.indexOf(s.variant.key) !== -1)
      if (this.selectedTab === 1) {
        redraw()
      }
    })
  }
}

function seekUserId(seek: CorrespondenceSeek) {
  return seek.username.toLowerCase()
}

function fixSeeks(seeks: CorrespondenceSeek[]): CorrespondenceSeek[] {
  const userId = session.getUserId()
  if (userId) seeks.sort((a, b) => {
    if (seekUserId(a) === userId) return -1
    if (seekUserId(b) === userId) return 1
    return 0
  })
  return uniqBy(seeks, s => {
    const username = seekUserId(s) === userId ? s.id : s.username
    const key = username + s.mode + s.variant.key + s.days + s.color
    return key
  })
}
