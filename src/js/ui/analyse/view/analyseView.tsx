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

import AnalyseCtrl from '../AnalyseCtrl'
import { EvalBox } from '../ceval/cevalView'
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

function renderAnalyseTabs(ctrl: AnalyseCtrl) {
  return h('div.analyse-tabs', [
    ctrl.ceval.enabled() ? h(EvalBox, { ctrl }) : null
  ])
}

function renderAnalyseTable(ctrl: AnalyseCtrl) {
  return h('div.analyse-table', {
    key: 'analyse'
  }, [
    renderAnalyseTabs(ctrl),
    h('div.analyse-game', h(Replay, { ctrl }))
  ])
}
