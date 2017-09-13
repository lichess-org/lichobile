import * as h from 'mithril/hyperscript'
import { hasNetwork, noNull, flatten, noop } from '../../../utils'
import * as chessFormat from '../../../utils/chessFormat'
import * as treeOps from '../../shared/tree/ops'
import i18n from '../../../i18n'
import continuePopup from '../../shared/continuePopup'
import { view as renderPromotion } from '../../shared/offlineRound/promotion'
import Board from '../../shared/Board'
import ViewOnlyBoard from '../../shared/ViewOnlyBoard'
import { Shape } from '../../shared/BoardBrush'
import * as helper from '../../helper'
import { notesView } from '../../shared/round/notes'
import menu from '../menu'
import analyseSettings from '../analyseSettings'
import { renderEval } from '../util'
import explorerView from '../explorer/explorerView'
import evalSummary from '../evalSummaryPopup'
import settings from '../../../settings'

import AnalyseCtrl from '../AnalyseCtrl'
import renderTree from './treeView'

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


export function renderContent(ctrl: AnalyseCtrl, isPortrait: boolean, bounds: ClientRect) {
  const player = ctrl.data.game.player
  const ceval = ctrl.node && ctrl.node.ceval
  const rEval = ctrl.node && ctrl.node.eval

  let board: Mithril.BaseNode

  let nextBest: string | undefined
  let curBestShape: Shape[] = [], pastBestShape: Shape[] = []
  if (!ctrl.explorer.enabled() && ctrl.ceval.enabled() && ctrl.vm.showBestMove) {
    nextBest = ctrl.nextNodeBest()
    curBestShape = nextBest ? moveOrDropShape(nextBest, 'paleBlue', player) :
    ceval && ceval.best ? moveOrDropShape(ceval.best, 'paleBlue', player) :
    []
  }
  if (ctrl.vm.showComments) {
    pastBestShape = rEval && rEval.best ?
    moveOrDropShape(rEval.best, 'paleGreen', player) : []
  }

  const nextStep = ctrl.explorer.enabled() && ctrl.node && treeOps.nodeAtPly(ctrl.nodeList, ctrl.node.ply + 1)

  const nextMoveShape: Shape[] = nextStep && nextStep.uci ?
  moveOrDropShape(nextStep.uci, 'palePurple', player) : []

  const shapes: Shape[] = nextMoveShape.length > 0 ?
  nextMoveShape : flatten([pastBestShape, curBestShape].filter(noNull))

  board = h(Board, {
    key: ctrl.vm.smallBoard ? 'board-small' : 'board-full',
    variant: ctrl.data.game.variant.key,
    chessground: ctrl.chessground,
    bounds,
    isPortrait,
    shapes,
    wrapperClasses: ctrl.vm.smallBoard ? 'halfsize' : ''
  })

  return h.fragment({ key: isPortrait ? 'portrait' : 'landscape' }, [
    board,
    <div className="analyse-tableWrapper">
      {ctrl.explorer.enabled() ?
        explorerView(ctrl) :
        renderAnalyseTable(ctrl)
      }
      {renderActionsBar(ctrl)}
    </div>
  ])
}

function moveOrDropShape(uci: string, brush: string, player: Color): Shape[] {
  if (uci.includes('@')) {
    const pos = chessFormat.uciToDropPos(uci)
    return [
      {
        brush,
        orig: pos
      },
      {
        orig: pos,
        piece: {
          role: chessFormat.uciToDropRole(uci),
          color: player
        },
        brush
      }
    ]
  } else {
    const move = chessFormat.uciToMove(uci)
    const prom = chessFormat.uciToProm(uci)
    const shapes: Shape[] = [{
      brush,
      orig: move[0],
      dest: move[1]
    }]
    if (prom) shapes.push({
      brush,
      orig: move[1],
      piece: {
        role: prom,
        color: player
      }
    })
    return shapes
  }
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

const spinnerPearl = <div className="spinner fa fa-hourglass-half"></div>
const EvalBox: Mithril.Component<{ ctrl: AnalyseCtrl }, {}> = {
  onbeforeupdate({ attrs }) {
    return !attrs.ctrl.vm.replaying
  },
  view({ attrs }) {
    const { ctrl } = attrs
    const node = ctrl.node
    if (!node) return null

    const { ceval } = node
    const fav = node.eval || ceval
    let pearl: Mithril.Children, percent: number

    if (fav && fav.cp !== undefined) {
      pearl = renderEval(fav.cp)
      percent = ceval ?
        Math.min(100, Math.round(100 * ceval.depth / ceval.maxDepth)) : 0
    }
    else if (fav && fav.mate !== undefined) {
      pearl = '#' + fav.mate
      percent = 100
    }
    else if (ctrl.gameOver()) {
      pearl = '-'
      percent = 0
    }
    else  {
      pearl = ctrl.vm.replaying ? '' : spinnerPearl
      percent = 0
    }

    return (
      <div className="analyse-cevalBox">
        <div className="analyse-curEval">
          { pearl }
          { ctrl.vm.showBestMove && ceval && ceval.bestSan ?
          <div className="analyse-bestMove">
            best {ceval.bestSan}
          </div> : null
          }
        </div>
        <div
          oncreate={({ state }: Mithril.DOMNode) => state.percent = percent}
          onupdate={({ dom, state }: Mithril.DOMNode) => {
            if (state.percent > percent) {
              // remove el to avoid downward animation
              const p = dom.parentNode
              if (p) {
                p.removeChild(dom)
                p.appendChild(dom)
              }
            }
            state.percent = percent
          }}
          className="analyse-cevalBar"
          style={{ width: `${percent}%` }}
        />
        { ceval ?
        <div className="analyse-engine_info">
          <p>depth {ceval.depth}/{ceval.maxDepth}</p>
          <p>{Math.round(ceval.nps / 1000)} kn/s, {ctrl.ceval.cores} {ctrl.ceval.cores > 1 ? 'cores' : 'core' }</p>
        </div> : null
        }
      </div>
    )
  }
}

function renderAnalyseTable(ctrl: AnalyseCtrl) {
  return (
    <div className="analyse-table" key="analyse">
      { ctrl.ceval.enabled() ?
        h(EvalBox, { ctrl }) : null
      }
      <div className="analyse-game">
        { ctrl.ceval.enabled() ?
          h(EvalBox, { ctrl }) : null
        }
        {h(Replay, { ctrl })}
      </div>
    </div>
  )
}

function renderActionsBar(ctrl: AnalyseCtrl) {

  const explorerBtnClass = [
    'action_bar_button',
    'fa',
    'fa-book',
    ctrl.explorer && ctrl.explorer.enabled() ? 'highlight' : ''
  ].join(' ')

  return (
    <section className="actions_bar analyse_actions_bar">
      <button className="action_bar_button fa fa-ellipsis-h" key="analyseMenu"
        oncreate={helper.ontap(ctrl.menu.open)}
      />
      {ctrl.ceval.allowed ?
        <button className="action_bar_button fa fa-gear" key="analyseSettings"
          oncreate={helper.ontap(ctrl.settings.open)}
        /> : null
      }
      {hasNetwork() ?
        <button className={explorerBtnClass} key="explorer"
          oncreate={helper.ontap(
            ctrl.explorer.toggle,
            () => window.plugins.toast.show('Opening explorer & endgame tablebase', 'short', 'bottom')
          )}
        /> : null
      }
      <button className="action_bar_button" data-icon="B" key="flipBoard"
        oncreate={helper.ontap(
          ctrl.flip,
          () => window.plugins.toast.show(i18n('flipBoard'), 'short', 'bottom')
        )}
      />
      <button className={'action_bar_button fa fa-' + (ctrl.vm.smallBoard ? 'compress' : 'expand')} key="expand-compress"
        oncreate={helper.ontap(
          ctrl.toggleBoardSize,
          () => window.plugins.toast.show('Expand/compress board', 'short', 'bottom')
        )}
      />
      <button key="backward" className="action_bar_button fa fa-backward"
        oncreate={helper.ontap(ctrl.stoprewind, undefined, ctrl.rewind)}
      />
      <button key="forward" className="action_bar_button fa fa-forward"
        oncreate={helper.ontap(ctrl.stopff, undefined, ctrl.fastforward)}
      />
    </section>
  )
}
