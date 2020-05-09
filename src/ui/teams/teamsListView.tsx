
import h from 'mithril/hyperscript'

//import * as utils from '../../utils'
import router from '../../router'
import * as helper from '../helper'
import { header as mainHeader } from '../shared/common'
import { backArrow } from '../shared/icons'
import settings from '../../settings'

import spinner from '../../spinner'
import { Team } from '../../lichess/interfaces/teams'

import i18n from '../../i18n'
import TabNavigation from '../shared/TabNavigation'
import TabView from '../shared/TabView'
import TeamsListCtrl from './TeamsListCtrl'

export function header(ctrl: TeamsListCtrl) {
  return mainHeader(h('div.teams_main_header', [
    h('div.main_header_title', i18n('teams')),
    h('button.main_header_button[data-icon=y]', {
      oncreate: helper.ontap(ctrl.goSearch)
    })
  ]))
}

export function body(ctrl: TeamsListCtrl) {
  if (ctrl)
    return null
  return null
  
  const tabsContent = [
    { id: 'allTeams', f: () => renderAllTeams(ctrl) },
    { id: 'myTeams', f: () => renderMyTeams(ctrl) },
  ]

  return [
    h('div.tabs-nav-header.subHeader',
      h(TabNavigation, {
        buttons: [
          { label: i18n('allTeams') },
          { label: i18n('myTeams') },
        ],
        selectedIndex: ctrl.currentTab,
        onTabChange: ctrl.onTabChange
      }),
    ),
    h(TabView, {
      selectedIndex: ctrl.currentTab,
      tabs: tabsContent,
      onTabChange: ctrl.onTabChange,
    })
  ]
}


export function searchModal(ctrl: TeamsListCtrl) {
  
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
          <input id="searchTeams" type="search"
          placeholder="Search teams" oninput={ctrl.onInput}
          autocapitalize="off"
          autocomplete="off"
          oncreate={helper.autofocus}
          />
        </div>
      </header>
      <ul id="teamSearchResults" className="modal_content native_scroller">
      {ctrl.searchResults ? ctrl.searchResults.map((u, i) => {
        const evenOrOdd = i % 2 === 0 ? 'even' : 'odd'
        return (
          <li className={`list_item nav ${evenOrOdd}`} key={u} oncreate={helper.ontapY(() => ctrl.goToTeam(u))}>
          {u}
          </li>
        )
      }) : null}
      </ul>
    </div>
  )
  
}

function renderAllTeams(ctrl: TeamsListCtrl) {
  const allTeams = ctrl.allTeams
  if (!allTeams) return (
    <div className="loader_container">
      {spinner.getVdom('monochrome')}
    </div>
  )

  return (
    <div className="native_scroller page leaderboard_wrapper">
      {allTeams.map(renderTeam)}
    </div>
  )
}

function renderMyTeams(ctrl: TeamsListCtrl) {
  const myTeams = ctrl.myTeams
  if (!myTeams) return (
    <div className="loader_container">
      {spinner.getVdom('monochrome')}
    </div>
  )

  return (
    <div className="native_scroller page leaderboard_wrapper">
      {myTeams.map(renderTeam)}
    </div>
  )
}

function renderTeam(team: Team) {
  return (
    <li key={team.id} className="list_item team_list" oncreate={helper.ontapY(() => router.set('/team/' + team.id))}>
      
      <span className="">
      
      </span>
    </li>
  )
}