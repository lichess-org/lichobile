import * as h from 'mithril/hyperscript'
import { noNull, noop } from '../../../utils'
import continuePopup from '../../shared/continuePopup'
import { view as renderPromotion } from '../../shared/offlineRound/promotion'
import ViewOnlyBoard from '../../shared/ViewOnlyBoard'
import * as helper from '../../helper'
import { notesView } from '../../shared/round/notes'
import menu from '../menu'
import analyseSettings from '../analyseSettings'
import explorerView from '../explorer/explorerView'
import evalSummary from '../evalSummaryPopup'
import settings from '../../../settings'

import AnalyseCtrl from '../AnalyseCtrl'
import { EvalBox } from '../ceval/cevalView'
import renderTree from './treeView'
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

export function viewOnlyBoard(color: Color, bounds: ClientRect, isSmall: boolean, fen: string) {
  return h('section.board_wrapper', {
    className: isSmall ? 'halfsize' : ''
  }, h(ViewOnlyBoard, { orientation: color, bounds, fen }))
}

function getMoveEl(e: Event) {
  const target = (e.target as HTMLElement)
  return target.tagName === 'MOVE' ? target :
    helper.findParentBySelector(target, 'move')
}

interface ReplayDataSet extends DOMStringMap {
  path: string
}
function onReplayTap(ctrl: AnalyseCtrl, e: Event) {
  const el = getMoveEl(e)
  if (el && (el.dataset as ReplayDataSet).path) {
    ctrl.jump((el.dataset as ReplayDataSet).path)
  }
}

let pieceNotation: boolean
const Replay: Mithril.Component<{ ctrl: AnalyseCtrl }, {}> = {
  onbeforeupdate({ attrs }) {
    return !attrs.ctrl.vm.replaying
  },
  view({ attrs }) {
    const { ctrl } = attrs
    pieceNotation = pieceNotation || settings.game.pieceNotation()
    const replayClass = 'analyse-replay native_scroller' + (pieceNotation ? ' displayPieces' : '')
    return (
      <div id="replay" className={replayClass}
        oncreate={helper.ontapY(e => onReplayTap(ctrl, e!), undefined, getMoveEl)}
      >
        { renderOpeningBox(ctrl) }
        { renderTree(ctrl) }
      </div>
    )
  }
}

function renderOpeningBox(ctrl: AnalyseCtrl) {
  const opening = ctrl.tree.getOpening(ctrl.nodeList) || ctrl.data.game.opening
  if (opening) return h('div', {
    key: 'opening-box',
    className: 'analyse-openingBox',
    oncreate: helper.ontapY(noop, () => window.plugins.toast.show(opening.eco + ' ' + opening.name, 'short', 'center'))
  }, [
    h('strong', opening.eco),
    ' ' + opening.name
  ])
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
