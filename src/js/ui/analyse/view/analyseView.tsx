import * as h from 'mithril/hyperscript'
import { noNull } from '../../../utils'
import continuePopup from '../../shared/continuePopup'
import { view as renderPromotion } from '../../shared/offlineRound/promotion'
import ViewOnlyBoard from '../../shared/ViewOnlyBoard'
import { notesView } from '../../shared/round/notes'
import menu from '../menu'
import analyseSettings from '../analyseSettings'
import explorerView from '../explorer/explorerView'
import evalSummary from '../evalSummaryPopup'
import TabNavigation from '../../shared/TabNavigation'

import AnalyseCtrl from '../AnalyseCtrl'
import { EvalBox } from '../ceval/cevalView'
import TabView from './TabView'
import Replay from './Replay'
import renderBoard from './boardView'
import renderActionsBar from './actionsView'

export function renderContent(ctrl: AnalyseCtrl, isPortrait: boolean, bounds: ClientRect) {
  return h.fragment({ key: isPortrait ? 'portrait' : 'landscape' }, [
    renderBoard(ctrl, isPortrait, bounds),
    h('div.analyse-tableWrapper', [
      ctrl.explorer.enabled() ? explorerView(ctrl) : renderAnalyseTable(ctrl),
      renderActionsBar(ctrl)
    ])
  ])
}

export function viewOnlyBoard(color: Color, bounds: ClientRect, isSmall: boolean, fen: string) {
  return h('section.board_wrapper', {
    className: isSmall ? 'halfsize' : ''
  }, h(ViewOnlyBoard, { orientation: color, bounds, fen }))
}

export function overlay(ctrl: AnalyseCtrl) {
  return [
    renderPromotion(ctrl),
    menu.view(ctrl.menu),
    analyseSettings.view(ctrl.settings),
    ctrl.notes ? notesView(ctrl.notes) : null,
    ctrl.evalSummary ? evalSummary.view(ctrl.evalSummary) : null,
    continuePopup.view(ctrl.continuePopup)
  ].filter(noNull)
}

function renderOpening(ctrl: AnalyseCtrl) {
  const opening = ctrl.tree.getOpening(ctrl.nodeList) || ctrl.data.game.opening
  if (opening) return h('div', {
    key: 'opening-title',
  }, [
    h('strong', opening.eco),
    ' ' + opening.name
  ])
}


const TABS = [
  {
    title: 'Game informations',
    className: 'fa fa-info'
  },
  {
    title: 'Move list',
    className: 'fa fa-list-alt'
  },
  {
    title: 'Charts',
    className: 'fa fa-line-chart'
  },
  {
    title: 'Explorer',
    className: 'fa fa-book'
  }
]

function renderAnalyseTabs(ctrl: AnalyseCtrl) {
  const curTitle = TABS[ctrl.currentTab].title
  return h('div.analyse-header', [
    ctrl.ceval.enabled() ? h(EvalBox, { ctrl }) : null,
    h('div.analyse-tabs', [
      h('div.tab-title', [
        ctrl.currentTab === 1 ?
          renderOpening(ctrl) || curTitle :
          curTitle
      ]),
      h(TabNavigation, {
        buttons: TABS,
        selectedIndex: ctrl.currentTab,
        onTabChange: ctrl.onTabChange
      })
    ])
  ])
}

function renderAnalyseTable(ctrl: AnalyseCtrl) {

  const tabsContent = [
    h('div', 'coucou'),
    h(Replay, { ctrl }),
    h('div', 'TODO'),
    h('div', 'explorer goes here')
  ]

  return h('div.analyse-table', {
    key: 'analyse'
  }, [
    renderAnalyseTabs(ctrl),
    h(TabView, {
      className: 'analyse-tabsContent',
      selectedIndex: ctrl.currentTab,
      content: tabsContent,
      onTabChange: ctrl.onTabChange
    })
  ])
}
