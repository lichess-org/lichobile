import h from 'mithril/hyperscript'
import * as utils from '../../utils'
import i18n, { fromNow } from '../../i18n'
import gameStatusApi from '../../lichess/status'
import { isGameData } from '../../lichess/interfaces'
import { GameData } from '../../lichess/interfaces/game'
import { AnalyseData } from '../../lichess/interfaces/analyse'
import * as playerApi from '../../lichess/player'
import * as gameApi from '../../lichess/game'
import CountdownTimer from './CountdownTimer'

interface Attrs {
  data: GameData | AnalyseData,
  subTitle?: 'players' | 'date' | 'tournament' | 'corres'
  kidMode?: boolean
}

export default {
  onbeforeupdate({ attrs }, { attrs: oldattrs }) {
    // careful with that, mutability doesn't help, but it should be easy to know
    // what changes here
    return attrs.data !== oldattrs.data || attrs.subTitle === 'corres' || attrs.subTitle !== oldattrs.subTitle ||
      attrs.kidMode !== oldattrs.kidMode
  },

  view({ attrs }) {
    const { data, subTitle, kidMode } = attrs
    const icon = data.game.source === 'import' ? '/' :
    utils.gameIcon(data.game.perf || data.game.variant.key)
    const title = gameApi.title(data)

    let subEls: Mithril.Children = null
    if (subTitle === 'players') {
      subEls = [
        h('span', playerApi.playerName(data.player, true, true, 12)),
        h('span.swords' , { 'data-icon': 'U' }),
        h('span', playerApi.playerName(data.opponent, true, true, 12))
      ]
    }
    else if (subTitle === 'date') {
      if (gameApi.playable(data)) {
        subEls = i18n('playingRightNow')
      }
      else if (gameStatusApi.aborted(data)) {
        subEls = i18n('gameAborted')
      }
      else if (data.game.createdAt) {
        subEls = fromNow(new Date(data.game.createdAt))
      }
    }
    else if (subTitle === 'corres' && isGameData(data)) {
      if (gameStatusApi.finished(data)) {
        subEls = i18n('gameOver')
      } else if (gameApi.isPlayerTurn(data)) {
        subEls = i18n('yourTurn')
      } else {
        subEls = i18n('waitingForOpponent')
      }
    }
    else if (subTitle === 'tournament' && isGameData(data) && data.tournament) {
      const ttime = data.tournament.secondsToFinish
      if (ttime) {
        subEls = [
          h('span.fa.fa-trophy'),
          h(CountdownTimer, { seconds: ttime }),
          h('span', ' • ' + data.tournament.name)
        ]
      }
      else {
        subEls = [
          h('span.fa.fa-trophy'),
          h('span', [
            data.tournament.name,
            data.game.createdAt ?
              (' (' + fromNow(new Date(data.game.createdAt)) + ')') : null
          ])
        ]
      }
    }

    return h('div.main_header_title', {
      className: subTitle !== undefined ? 'withSub' : ''
    }, [
      h('h1.header-gameTitle', [
        kidMode ? h('span.kiddo', '😊') : null,
        h('span.withIcon', { 'data-icon': icon }),
        h('span', title)
      ]),
      subEls ? h('h2.header-subTitle', subEls) : null
    ])
  }

} as Mithril.Component<Attrs>
