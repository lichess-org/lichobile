import * as stream from 'mithril/stream'

import socket from '../socket'
import redraw from '../utils/redraw'
import router from '../router'
import * as utils from '../utils'
import i18n from '../i18n'
import { perfTitle } from '../lichess/perfs'
import { RankingKey, RankingUser, Rankings } from '../lichess/interfaces/user'
import * as xhr from './players/playerXhr'
import layout from './layout'
import { userStatus, dropShadowHeader } from './shared/common'
import * as helper from './helper'

interface State {
  ranking: Mithril.Stream<Rankings | undefined>
  catOpenedMap: Mithril.Stream<Record<RankingKey, boolean>>
  toggleRankingCat(key: RankingKey): void
}

export default {
  oncreate: helper.viewFadeIn,

  oninit() {

    socket.createDefault()

    this.ranking = stream(undefined)
    this.catOpenedMap = stream({} as Record<RankingKey, boolean>)

    this.toggleRankingCat = (key: RankingKey) => {
      this.catOpenedMap()[key] = !this.catOpenedMap()[key]
    }

    xhr.ranking()
    .then(data => {
      this.catOpenedMap(utils.mapObject(data, () => false))
      this.ranking(data)
      redraw()
    })
    .catch(err => {
      utils.handleXhrError(err)
      router.set('/')
    })
  },

  view(vnode) {
    const ctrl = vnode.state

    return layout.free(
      dropShadowHeader(i18n('leaderboard')),
      renderBody(ctrl)
    )
  }
} as Mithril.Component<{}, State>

function renderBody(ctrl: State) {
  const ranking = ctrl.ranking()
  if (!ranking) return

  const keys = Object.keys(ranking) as RankingKey[]
  const categories = keys
    .filter(k => k !== 'online')
    .map((k: PerfKey) => renderRankingCategory(ctrl, ranking, k))
  return (
    <div id="allRanking" className="native_scroller page">
      {categories}
    </div>
  )
}

function renderRankingCategory(ctrl: State, ranking: Rankings, key: PerfKey) {
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
