import h from 'mithril/hyperscript'
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

  return h('div.' + className, {'id': 'searchTeamsModal'}, [
    h('header.main_header', [
      h('button.main_header_button', {'oncreate': helper.ontap(() => ctrl.closeSearch())}, [backArrow]),
      h('div.search_input.allow_select', [
        h('input', {'id': 'searchTeams', 'type': 'search', 'placeholder': i18n('search'), 'oninput': ctrl.onInput,
          'autocapitalize': 'off', 'autocomplete': 'off', 'oncreate': helper.autofocus})
      ])
    ]),
    h('ul.modal_content.native_scroller', {'oncreate': helper.ontapY(onTeamTap, undefined, helper.getLI)}, [
      ctrl.searchResults ? ctrl.searchResults.currentPageResults.map(renderTeam) : null
    ])
  ])
}

function renderAllTeams(ctrl: TeamsListCtrl) {
  if (!ctrl.allTeams) {
    return h('div.loader_container', [
      spinner.getVdom('monochrome')
    ])
  }

  return h('ul.teamsSuggestion.native_scroller.page',
    {'oncreate': helper.ontapY(onTeamTap, undefined, helper.getLI)},
    [ctrl.allTeams.currentPageResults.map(renderTeam)])
}

function renderMyTeams(ctrl: TeamsListCtrl) {
  if (!ctrl.myTeams) {
    return h('div.loader_container', [
      spinner.getVdom('monochrome')
    ])
  }

  return h('ul.teamsSuggestion.native_scroller.page',
    {'oncreate': helper.ontapY(onTeamTap, undefined, helper.getLI)},
    [ctrl.myTeams.map(renderTeam)])
}

function onTeamTap(e: Event) {
  const el = helper.getLI(e)
  const ds = el?.dataset as DOMStringMap
  if (ds.id) {
    router.set('/teams/' + ds.id)
  }
}

function renderTeam(team: Team, i: number) {
  const evenOrOdd = i % 2 === 0 ? 'even' : 'odd'
  return h('li.list_item.teamSuggestion.nav.' + evenOrOdd, {'data-id': team.id}, [
    team.name,
    h('span.nbMembers', [
      team.nbMembers
    ])
  ])
}
