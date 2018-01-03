import socket from '../../socket'
import * as helper from '../helper'
import { body } from './homeView'
import layout from '../layout'
import { dropShadowHeader } from '../shared/common'
import redraw from '../../utils/redraw'
import { timeline as timelineXhr } from '../../xhr'
import { dailyPuzzle as dailyPuzzleXhr, featuredTournaments as featuredTournamentsXhr } from './homeXhr'
import { hasNetwork, noop } from '../../utils'
import { isForeground, setForeground } from '../../utils/appMode'
import { supportedTypes as supportedTimelineTypes } from '../timeline'
import { PongMessage, TimelineEntry, DailyPuzzle } from '../../lichess/interfaces'
import { TournamentListItem } from '../../lichess/interfaces/tournament'
import * as stream from 'mithril/stream'

export interface Ctrl {
  nbConnectedPlayers: Mithril.Stream<number>
  nbGamesInPlay: Mithril.Stream<number>
  dailyPuzzle: Mithril.Stream<any>
  featuredTournaments: Mithril.Stream<Array<TournamentListItem>>
  timeline: Mithril.Stream<Array<any>>
  init(): void
  onResume(): void
}

export default {
  oninit() {
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

    this.ctrl = {
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
    document.removeEventListener('online', this.ctrl.init)
    document.removeEventListener('resume', this.ctrl.onResume)
  },

  view() {
    const header = () => dropShadowHeader('lichess.org')

    return layout.free(header, () => body(this.ctrl))
  }
} as Mithril.Component<{}, { ctrl: Ctrl }>
