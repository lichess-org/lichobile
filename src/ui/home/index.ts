import socket from '../../socket'
import * as helper from '../helper'
import { body } from './homeView'
import layout from '../layout'
import { dropShadowHeader } from '../shared/common'
import { HomeState } from './interfaces'
import redraw from '../../utils/redraw'
import { timeline as timelineXhr } from '../../xhr'
import { dailyPuzzle as dailyPuzzleXhr, featuredTournaments as featuredTournamentsXhr } from './homeXhr'
import { hasNetwork, noop } from '../../utils'
import { isForeground, setForeground } from '../../utils/appMode'
import { supportedTypes as supportedTimelineTypes } from '../timeline'
import { PongMessage, TimelineEntry, DailyPuzzle } from '../../lichess/interfaces'
import { TournamentListItem } from '../../lichess/interfaces/tournament'
import * as stream from 'mithril/stream'

const HomeScreen: Mithril.Component<{}, HomeState> = {
  oninit(vnode) {

    const nbConnectedPlayers = stream<number>()
    const nbGamesInPlay = stream<number>()
    const dailyPuzzle = stream<DailyPuzzle>()
    const featuredTournaments = stream<TournamentListItem[]>([])
    const timeline = stream<TimelineEntry[]>([])

    function init() {
      if (isForeground()) {
        socket.createLobby('homeLobby', noop, {
          n: (_: never, d: PongMessage) => {
            nbConnectedPlayers(d.d)
            nbGamesInPlay(d.r)
            redraw()
          }
        })

        Promise.all([
          dailyPuzzleXhr(),
          featuredTournamentsXhr()
        ])
        .then(results => {
          const [dailyData, featuredTournamentsData] = results
          dailyPuzzle(dailyData.puzzle)
          featuredTournaments(featuredTournamentsData.featured)
          redraw()
        })
        .catch(noop)

        timelineXhr()
        .then(data => {
          timeline(
            data.entries
            .filter((o: TimelineEntry) => supportedTimelineTypes.indexOf(o.type) !== -1)
            .slice(0, 10)
          )
          redraw()
        })
        .catch(noop)
      }
    }

    function onResume() {
      setForeground()
      init()
    }

    if (hasNetwork()) {
      init()
    }

    document.addEventListener('online', init)
    document.addEventListener('resume', onResume)

    vnode.state = {
      nbConnectedPlayers,
      nbGamesInPlay,
      dailyPuzzle,
      timeline,
      featuredTournaments,
      init,
      onResume
    }
  },

  oncreate: helper.viewFadeIn,

  onremove() {
    socket.destroy()
    document.removeEventListener('online', this.init)
    document.removeEventListener('resume', this.onResume)
  },
  view() {
    const header = () => dropShadowHeader('lichess.org')

    return layout.free(header, () => body(this))
  }
}

export default HomeScreen
