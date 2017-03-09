import socket from '../../socket'
import redraw from '../../utils/redraw'
import router from '../../router'
import * as utils from '../../utils'
import * as helper from '../helper'
import * as xhr from './playerXhr'
import layout from '../layout'
import { userStatus, dropShadowHeader } from '../shared/common'
import i18n from '../../i18n'
import { perfTitle } from '../../lichess/perfs'
import * as stream from 'mithril/stream'
import { RankingKey, RankingUser, Rankings } from '../../lichess/interfaces/user'

interface State {
  ranking: Mithril.Stream<Rankings | undefined>
  catOpenedMap: Mithril.Stream<Record<RankingKey, boolean>>
  toggleRankingCat(key: RankingKey): void
}

const RankingScreen: Mithril.Component<{}, State> = {
  oncreate: helper.viewFadeIn,

  oninit(vnode) {

    helper.analyticsTrackView('Leaderboard')

    socket.createDefault()

    const ranking: Mithril.Stream<Rankings | undefined> = stream(undefined)
    const catOpenedMap = stream({} as Record<RankingKey, boolean>)

    xhr.ranking()
    .then(data => {
      catOpenedMap(utils.mapObject(data, () => false))
      ranking(data)
      redraw()
    })
    .catch(err => {
      utils.handleXhrError(err)
      router.set('/')
    })

    vnode.state = {
      ranking,
      catOpenedMap,
      toggleRankingCat(key: RankingKey) {
        catOpenedMap()[key] = !catOpenedMap()[key]
      }
    }
  },

  view(vnode) {
    const ctrl = vnode.state

    return layout.free(
      () => dropShadowHeader(i18n('leaderboard')),
      renderBody.bind(undefined, ctrl)
    )
  }
}

export default RankingScreen

function renderBody(ctrl: State) {
  if (!ctrl.ranking()) return

  const keys = Object.keys(ctrl.ranking()) as RankingKey[]
  const categories = keys
    .filter(k => k !== 'online')
    .map(k => renderRankingCategory(ctrl, k))
  return (
    <div id="allRanking" className="native_scroller page">
      {categories}
    </div>
  )
}

function renderRankingCategory(ctrl: State, key: RankingKey) {
  const ranking = ctrl.ranking()
  if (ranking) {
    const toggleDataIcon = ctrl.catOpenedMap()[key] ? 'S' : 'R'
    const toggleFunc = helper.isWideScreen() ? utils.noop : () => ctrl.toggleRankingCat(key)
    return (
      <section className={'ranking ' + key}>
        <h3 className="rankingPerfTitle" oncreate={helper.ontapY(toggleFunc)}>
          <span className="perfIcon" data-icon={utils.gameIcon(key)} />
          {perfTitle(key)}
          {helper.isWideScreen() ? null : <span className="toggleIcon" data-icon={toggleDataIcon} />}
        </h3>
        {ctrl.catOpenedMap()[key] || helper.isWideScreen() ?
        <ul className="rankingList">
          {ranking[key].map((p: RankingUser) => renderRankingPlayer(p, key))}
        </ul> : null
        }
      </section>
    )
  }
}

function renderRankingPlayer(user: RankingUser, key: RankingKey) {
  return (
    <li className="rankingPlayer" oncreate={helper.ontapY(() => router.set('/@/' + user.id))}>
      {userStatus(user)}
      <span className="rating">
        {user.perfs[key].rating}
      </span>
    </li>
  )
}
