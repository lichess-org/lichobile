import socket from '../../socket'
import * as helper from '../helper'
import { body } from './homeView'
import layout from '../layout'
import { dropShadowHeader } from '../shared/common'
import { HomeState } from './interfaces'
import redraw from '../../utils/redraw'
import { timeline as timelineXhr } from '../../xhr'
import { dailyPuzzle as dailyPuzzleXhr, topPlayersOfTheWeek as topPlayersOfTheWeekXhr } from './homeXhr'
import { hasNetwork, noop } from '../../utils'
import { isForeground, setForeground } from '../../utils/appMode'
import { supportedTypes as supportedTimelineTypes } from '../timeline'
import { PongMessage, TimelineEntry, DailyPuzzle } from '../../lichess/interfaces'
import { User } from '../../lichess/interfaces/user'
import * as stream from 'mithril/stream'

const HomeScreen: Mithril.Component<{}, HomeState> = {
  oninit(vnode) {

    const nbConnectedPlayers = stream<number>()
    const nbGamesInPlay = stream<number>()
    const dailyPuzzle = stream<DailyPuzzle>()
    const weekTopPlayers = stream<Array<User>>([])
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
          topPlayersOfTheWeekXhr()
        ])
        .then(results => {
          const [dailyData, topPlayersData] = results
          dailyPuzzle(dailyData.puzzle)
          weekTopPlayers(topPlayersData)
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
      weekTopPlayers,
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
