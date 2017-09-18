import * as utils from '../../utils'
import router from '../../router'
import * as helper from '../helper'
import { menuButton, friendsButton, userStatus } from '../shared/common'
import { backArrow } from '../shared/icons'
import settings from '../../settings'
import i18n from '../../i18n'
import { User } from '../../lichess/interfaces/user'

import { State } from './'

export function header(ctrl: State) {
  return [
    <nav>
      {menuButton()}
      <div className="main_header_title">{i18n('players')}</div>
      <div className="buttons">
        {friendsButton()}
        <button className="main_header_button" key="searchPlayers" data-icon="y"
          oncreate={helper.ontap(ctrl.goSearch)}/>
      </div>
    </nav>,
    <div className="main_header_drop_shadow" />
  ]
}

export function searchModal(ctrl: State) {
  if (!ctrl.isSearchOpen())
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
        <div className="main_header_drop_shadow" />
      </header>
      <ul id="playersSearchResults" className="modal_content native_scroller">
      {ctrl.searchResults().map(u => {
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

function onPlayerTap(e: Event) {
  const el = helper.getLI(e)
  const ds = el.dataset as DOMStringMap
  if (el && ds.id) {
    router.set('/@/' + ds.id)
  }
}

export function body(ctrl: State) {
  return (
    <ul className="playersSuggestion native_scroller page"
      oncreate={helper.ontapY(onPlayerTap, undefined, helper.getLI)}
    >
      {ctrl.players().map(renderPlayer)}
    </ul>
  )
}

function renderPlayer(user: User) {
  const perf = Object.keys(user.perfs).reduce((prev, curr) => {
    if (!prev) return curr
    if (curr === 'opening' || curr === 'puzzle') return prev
    if (user.perfs[prev].rating < user.perfs[curr].rating)
      return curr
    else
      return prev
  })
  return (
    <li className="list_item playerSuggestion nav" data-id={user.id}>
      {userStatus(user)}
      <span className="rating" data-icon={utils.gameIcon(perf)}>
        {user.perfs[perf].rating}
      </span>
    </li>
  )
}
