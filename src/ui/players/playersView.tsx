import * as h from 'mithril/hyperscript'
import * as utils from '../../utils'
import router from '../../router'
import * as helper from '../helper'
import { menuButton, friendsButton, userStatus } from '../shared/common'
import { backArrow } from '../shared/icons'
import settings from '../../settings'
import i18n from '../../i18n'
import spinner from '../../spinner'
import { perfTitle } from '../../lichess/perfs'
import { User, RankingKey, RankingUser, Rankings } from '../../lichess/interfaces/user'
import TabNavigation from '../shared/TabNavigation'
import TabView from '../shared/TabView'

import PlayersCtrl from './PlayersCtrl'

export function header(ctrl: PlayersCtrl) {
  return [
    <nav>
      {menuButton()}
      <div className="main_header_title">{i18n('players')}</div>
      <div className="buttons">
        {friendsButton()}
        <button className="main_header_button" key="searchPlayers" data-icon="y"
          oncreate={helper.ontap(ctrl.goSearch)}/>
      </div>
    </nav>
  ]
}

export function body(ctrl: PlayersCtrl) {
  const tabsContent = [
    () => renderLeaderboard(ctrl),
    () => onlinePlayers(ctrl),
  ]

  return [
    h('div.tabs-nav-header.subHeader',
      h(TabNavigation, {
        buttons: [
          { label: i18n('leaderboard') },
          { label: i18n('onlinePlayers') },
        ],
        selectedIndex: ctrl.currentTab,
        onTabChange: ctrl.onTabChange
      }),
    ),
    h(TabView, {
      selectedIndex: ctrl.currentTab,
      contentRenderers: tabsContent,
      onTabChange: ctrl.onTabChange,
      withWrapper: true,
    })
  ]
}

export function searchModal(ctrl: PlayersCtrl) {
  if (!ctrl.isSearchOpen)
    return null

  const className = [
    'modal',
    'show',
    settings.general.theme.background()
  ].join(' ')

  return (
    <div id="searchPlayersModal" className={className}>
      <header class="main_header">
        <button className="main_header_button" oncreate={helper.ontap(() => ctrl.closeSearch())}>
          {backArrow}
        </button>
        <div className="search_input allow_select">
          <input id="searchPlayers" type="search"
          placeholder="Search players" oninput={ctrl.onInput}
          autocapitalize="off"
          autocomplete="off"
          oncreate={helper.autofocus}
          />
        </div>
      </header>
      <ul id="playersSearchResults" className="modal_content native_scroller">
      {ctrl.searchResults.map(u => {
        return (
          <li className="list_item nav" key={u} oncreate={helper.ontapY(() => ctrl.goToProfile(u))}>
          {u}
          </li>
        )
      })}
      </ul>
    </div>
  )
}

function onlinePlayers(ctrl: PlayersCtrl) {
  return ctrl.players ?
    <ul className="playersSuggestion native_scroller page"
      oncreate={helper.ontapY(onPlayerTap, undefined, helper.getLI)}
    >
      {ctrl.players.map(renderPlayer)}
    </ul> :
    <div className="loader_container">
      {spinner.getVdom('monochrome')}
    </div>
}

function onPlayerTap(e: Event) {
  const el = helper.getLI(e)
  const ds = el.dataset as DOMStringMap
  if (el && ds.id) {
    router.set('/@/' + ds.id)
  }
}

function renderPlayer(user: User) {
  const perf = Object.keys(user.perfs).reduce((prev, curr) => {
    if (!prev) return curr
    if (curr === 'opening' || curr === 'puzzle') return prev
    if (user.perfs[prev].rating < user.perfs[curr].rating)
      return curr
    else
      return prev
  }) as PerfKey
  return (
    <li className="list_item playerSuggestion nav" data-id={user.id}>
      {userStatus(user)}
      <span className="rating" data-icon={utils.gameIcon(perf)}>
        {user.perfs[perf].rating}
      </span>
    </li>
  )
}

function renderLeaderboard(ctrl: PlayersCtrl) {
  const leaderboard = ctrl.leaderboard
  if (!leaderboard) return (
    <div className="loader_container">
      {spinner.getVdom('monochrome')}
    </div>
  )

  const keys = Object.keys(leaderboard) as readonly RankingKey[]
  const categories = keys
    .filter(k => k !== 'online')
    .map((k: PerfKey) => renderRankingCategory(leaderboard, k))
  return (
    <div className="native_scroller page">
      {categories}
    </div>
  )
}

function renderRankingCategory(ranking: Rankings, key: PerfKey) {
  return (
    <section className={'ranking ' + key}>
      <h3 className="leaderboard_title">
      <span className="perfIcon" data-icon={utils.gameIcon(key)} />
        {perfTitle(key)}
      </h3>
      <ul className="leaderboard">
      {ranking[key].map((p: RankingUser) => renderRankingPlayer(p, key))}
      </ul>
    </section>
  )
}

function renderRankingPlayer(user: RankingUser, key: RankingKey) {
  return (
    <li className="leaderboard_player" oncreate={helper.ontapY(() => router.set('/@/' + user.id))}>
      {userStatus(user)}
      <span className="rating">
        {user.perfs[key].rating}
      </span>
    </li>
  )
}
