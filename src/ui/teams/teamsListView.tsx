
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
    <div id="searchTeamsModal" className={className}>
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
  return ctrl.allTeams ?
  <ul className="teamsSuggestion native_scroller page"
    oncreate={helper.ontapY(onTeamTap, undefined, helper.getLI)}
  >
    {ctrl.allTeams.currentPageResults.map(renderTeam)}
  </ul> :
  <div className="loader_container">
    {spinner.getVdom('monochrome')}
  </div>
}

function renderMyTeams(ctrl: TeamsListCtrl) {
  return ctrl.myTeams ?
  <ul className="teamsSuggestion native_scroller page"
    oncreate={helper.ontapY(onTeamTap, undefined, helper.getLI)}
  >
    {ctrl.myTeams.map(renderTeam)}
  </ul> :
  <div className="loader_container">
    {spinner.getVdom('monochrome')}
  </div>
}

function onTeamTap(e: Event) {
  const el = helper.getLI(e)
  const ds = el.dataset as DOMStringMap
  if (el && ds.id) {
    router.set('/teams/' + ds.id)
  }
}

function renderTeam(team: Team, i: number) {
  const evenOrOdd = i % 2 === 0 ? 'even' : 'odd'
  return (
    <li className={`list_item teamSuggestion nav ${evenOrOdd}`} data-id={team.id}>
      {team.name}
      <span className="nbMembers">
        {team.nbMembers}
      </span>
    </li>
  )
}