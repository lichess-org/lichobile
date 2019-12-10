import { Plugins, AppState, NetworkStatus, PluginListenerHandle } from '@capacitor/core'
import Zanimo from '../../utils/zanimo'
import globalConfig from '../../config'
import socket, { SocketIFace } from '../../socket'
import redraw from '../../utils/redraw'
import signals from '../../signals'
import settings from '../../settings'
import { timeline as timelineXhr, seeks as corresSeeksXhr, lobby as lobbyXhr, featured as featuredXhr } from '../../xhr'
import { hasNetwork, noop } from '../../utils'
import { fromNow } from '../../i18n'
import { isForeground } from '../../utils/appMode'
import { PongMessage, TimelineEntry, DailyPuzzle, CorrespondenceSeek, FeaturedGame, FeaturedPlayer } from '../../lichess/interfaces'
import { TournamentListItem } from '../../lichess/interfaces/tournament'
import { Player } from '../../lichess/interfaces/game'
import { PuzzleData } from '../../lichess/interfaces/training'
import session from '../../session'
import { supportedTypes as supportedTimelineTypes } from '../timeline'
import offlinePuzzleDB from '../training/database'
import { loadNewPuzzle } from '../training/offlineService'

import { dailyPuzzle as dailyPuzzleXhr, featuredTournaments as featuredTournamentsXhr } from './homeXhr'

export default class HomeCtrl {
  public selectedTab: number

  public socketIface?: SocketIFace
  public tvFeed?: EventSource

  public featured?: FeaturedGame
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
      console.debug('networkStatusChange')
      if (s.connected) this.init()
    })

    this.appStateListener = Plugins.App.addListener('appStateChange', (state: AppState) => {
      console.debug('appStateChange')
      if (state.isActive) this.init()
      else {
        if (this.tvFeed) this.tvFeed.close()
      }
    })
  }

  public socketSend = <D>(t: string, d: D): void => {
    if (this.socketIface) this.socketIface.send(t, d)
  }

  public unload = () => {
    this.networkListener.remove()
    this.appStateListener.remove()
    if (this.tvFeed) {
      this.tvFeed.close()
    }
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

      this.tvFeed = new EventSource(globalConfig.apiEndPoint + '/tv/feed')
      this.tvFeed.onmessage = (ev) => {
        const data = JSON.parse(ev.data)
        if (data.t === 'fen') {
          if (this.featured) {
            this.featured.fen = data.d.fen
            this.featured.lastMove = data.d.lm
            redraw()
          }
        }

        if (data.t === 'featured') {
          this.featured = undefined
          // TODO use feed instead
          this.getFeatured()
        }
      }

      this.getFeatured()

      Promise.all([
        dailyPuzzleXhr(),
        featuredTournamentsXhr(),
        timelineXhr()
      ])
      .then(results => {
        const [dailyData, featuredTournamentsData, timeline] = results
        this.dailyPuzzle = dailyData.puzzle
        this.featuredTournaments = featuredTournamentsData.featured
        this.timeline = timeline.entries
          .filter((o: TimelineEntry) => supportedTimelineTypes.indexOf(o.type) !== -1)
          .slice(0, 15)
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
    if (this.selectedTab === 1) {
      this.reloadCorresPool()
    }
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

  private getFeatured = () => {
    featuredXhr('best', false)
    .then((data) => {
      const opp = playerToFeatured(data.opponent)
      const player = playerToFeatured(data.player)

      this.featured = {
        black: data.game.player === 'white' ? opp : player,
        color: data.orientation,
        fen: data.game.fen,
        id: data.game.id,
        lastMove: data.game.lastMove,
        white: data.game.player === 'white' ? player : opp,
      }
      if (data.clock) {
        this.featured.clock = {
          increment: data.clock.increment,
          initial: data.clock.initial
        }
      }

      redraw()
    })
  }

  private reloadCorresPool = () => {
    if (this.selectedTab === 1) {
      corresSeeksXhr(false)
      .then(d => {
        this.corresPool = fixSeeks(d).filter(s => settings.game.supportedVariants.indexOf(s.variant.key) !== -1)
        redraw()
      })
    }
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
  return [
    ...seeks
    .map(s => {
      const username = seekUserId(s) === userId ? s.id : s.username
      const key = username + s.mode + s.variant.key + s.days + s.color
      return [s, key]
    })
    .filter(([_, key], i, a) => a.map(e => e[1]).indexOf(key) === i)
    .map(([s]) => s)
  ] as CorrespondenceSeek[]
}

function playerToFeatured(p: Player): FeaturedPlayer {
  return {
    name: p.name || p.username || p.user && p.user.username || '',
    rating: p.rating || 0,
    ratingDiff: p.ratingDiff || 0,
    berserk: p.berserk,
    title: p.user && p.user.title,
  }
}
