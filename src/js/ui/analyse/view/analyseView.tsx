import * as h from 'mithril/hyperscript'
import { noNull } from '../../../utils'
import continuePopup from '../../shared/continuePopup'
import { view as renderPromotion } from '../../shared/offlineRound/promotion'
import ViewOnlyBoard from '../../shared/ViewOnlyBoard'
import { notesView } from '../../shared/round/notes'
import menu from '../menu'
import analyseSettings from '../analyseSettings'
import TabNavigation from '../../shared/TabNavigation'

import AnalyseCtrl from '../AnalyseCtrl'
import { EvalBox } from '../ceval/cevalView'
import renderExplorer from '../explorer/explorerView'
import TabView from './TabView'
import Replay from './Replay'
import renderComputerAnalysis from './computerAnalysisView'
import renderBoard from './boardView'
import renderGameInfos from './gameInfosView'
import renderActionsBar from './actionsView'

export function renderContent(ctrl: AnalyseCtrl, isPortrait: boolean, bounds: ClientRect) {
  return h.fragment({ key: isPortrait ? 'portrait' : 'landscape' }, [
    renderBoard(ctrl, isPortrait, bounds),
    h('div.analyse-tableWrapper', [
      renderAnalyseTable(ctrl),
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

function renderAnalyseTabs(ctrl: AnalyseCtrl) {

  const curTitle = ctrl.currentTab().title

  return h('div.analyse-header', [
    ctrl.ceval.enabled() ? h(EvalBox, { ctrl }) : null,
    h('div.analyse-tabs', [
      h('div.tab-title', [
        ctrl.currentTab().id === 'explorer' ?
        renderOpening(ctrl) || curTitle :
        curTitle
      ]),
      h(TabNavigation, {
        buttons: ctrl.availableTabs(),
        selectedIndex: ctrl.currentTabIndex,
        onTabChange: ctrl.onTabChange
      })
    ])
  ])
}

function renderReplay(ctrl: AnalyseCtrl) {
  return h(Replay, { ctrl })
}

const TabsContentRendererMap: { [id: string]: (ctrl: AnalyseCtrl) => Mithril.BaseNode } = {
  infos: renderGameInfos,
  moves: renderReplay,
  explorer: renderExplorer,
  charts: renderComputerAnalysis
}

function renderAnalyseTable(ctrl: AnalyseCtrl) {

  const tabsContent = ctrl.availableTabs().map(t =>
    TabsContentRendererMap[t.id](ctrl)
  )

  return h('div.analyse-table', {
    key: 'analyse'
  }, [
    renderAnalyseTabs(ctrl),
    h(TabView, {
      className: 'analyse-tabsContent',
      selectedIndex: ctrl.currentTabIndex,
      content: tabsContent,
      onTabChange: ctrl.onTabChange
    })
  ])
}
