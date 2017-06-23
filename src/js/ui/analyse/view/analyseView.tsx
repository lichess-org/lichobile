import * as h from 'mithril/hyperscript'
import { hasNetwork, playerName, oppositeColor, noNull, gameIcon, flatten, noop } from '../../../utils'
import * as chessFormat from '../../../utils/chessFormat'
import * as treeOps from '../../../utils/tree/ops'
import i18n from '../../../i18n'
import router from '../../../router'
import * as gameApi from '../../../lichess/game'
import gameStatusApi from '../../../lichess/status'
import continuePopup from '../../shared/continuePopup'
import { view as renderPromotion } from '../../shared/offlineRound/promotion'
import Board from '../../shared/Board'
import ViewOnlyBoard from '../../shared/ViewOnlyBoard'
import { Shape } from '../../shared/BoardBrush'
import * as helper from '../../helper'
import { notesView } from '../../shared/round/notes'
import { formatClockTime } from '../../shared/round/clock/clockView'
import menu from '../menu'
import analyseSettings from '../analyseSettings'
import { renderEval, isSynthetic } from '../util'
import CrazyPocket from '../../shared/round/crazy/CrazyPocket'
import explorerView from '../explorer/explorerView'
import evalSummary from '../evalSummaryPopup'
import settings from '../../../settings'

import AnalyseCtrl from '../AnalyseCtrl'

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
        renderAnalyseTable(ctrl, isPortrait)
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

function renderAnalyseTable(ctrl: AnalyseCtrl, isPortrait: boolean) {
  return (
    <div className="analyse-table" key="analyse">
      {renderInfosBox(ctrl, isPortrait)}
      <div className="analyse-game">
        { ctrl.ceval.enabled() ?
          h(EvalBox, { ctrl }) : null
        }
        {h(Replay, { ctrl })}
      </div>
    </div>
  )
}

function renderInfosBox(ctrl: AnalyseCtrl, isPortrait: boolean) {

  return (
    <div className="analyse-infosBox">
      { isSynthetic(ctrl.data) ?
        renderVariantSelector(ctrl) : null
      }
      <div className="native_scroller">
        { isSynthetic(ctrl.data) ?
          (ctrl.data.game.variant.key === 'crazyhouse' ? renderSyntheticPockets(ctrl) : null) :
          renderGameInfos(ctrl, isPortrait)
        }
      </div>
    </div>
  )
}

function renderVariantSelector(ctrl: AnalyseCtrl) {
  const variant = ctrl.data.game.variant.key
  const icon = gameIcon(variant)
  let availVariants = settings.analyse.availableVariants
  if (variant === 'fromPosition') {
    availVariants = availVariants.concat([['From position', 'fromPosition']])
  }
  return (
    <div className="select_input analyse_variant_selector">
      <label for="variant_selector">
        <i data-icon={icon} />
      </label>
      <select id="variant_selector" value={variant} onchange={(e: Event) => {
        const val = (e.target as HTMLSelectElement).value
        settings.analyse.syntheticVariant(val as VariantKey)
        router.set(`/analyse/variant/${val}`)
      }}>
        {availVariants.map(v => {
          return <option key={v[1]} value={v[1]}>{v[0]}</option>
        })}
      </select>
    </div>
  )
}

function getChecksCount(ctrl: AnalyseCtrl, color: Color) {
  const node = ctrl.node
  return node && node.checkCount && node.checkCount[oppositeColor(color)]
}

function renderSyntheticPockets(ctrl: AnalyseCtrl) {
  const player = ctrl.data.player
  const opponent = ctrl.data.opponent
  return (
    <div className="analyse-gameInfosWrapper synthetic">
      <div className="analyseOpponent">
        <div className="analysePlayerName">
          <span className={'color-icon ' + player.color} />
          {player.color}
        </div>
        {ctrl.node && ctrl.node.crazyhouse ? h(CrazyPocket, {
          ctrl: { chessground: ctrl.chessground, canDrop: ctrl.canDrop },
          crazyData: ctrl.node.crazyhouse,
          color: player.color,
          position: 'top'
        }) : null}
      </div>
      <div className="analyseOpponent">
        <div className="analysePlayerName">
          <span className={'color-icon ' + opponent.color} />
          {opponent.color}
        </div>
        {ctrl.node && ctrl.node.crazyhouse ? h(CrazyPocket, {
          ctrl: { chessground: ctrl.chessground, canDrop: ctrl.canDrop },
          crazyData: ctrl.node.crazyhouse,
          color: opponent.color,
          position: 'bottom'
        }) : null}
      </div>
    </div>
  )
}

function renderGameInfos(ctrl: AnalyseCtrl, isPortrait: boolean) {
  const player = ctrl.data.player
  const opponent = ctrl.data.opponent
  if (!player || !opponent) return null

  const isCrazy = ctrl.data.game.variant.key === 'crazyhouse'

  return (
    <div className="analyse-gameInfosWrapper">
      <div className="analyseOpponent">
        <div className={'analysePlayerName' + (isCrazy ? ' crazy' : '')}>
          <span className={'color-icon ' + player.color} />
          {playerName(player, true)}
          {helper.renderRatingDiff(player)}
          { ctrl.data.game.variant.key === 'threeCheck' && ctrl.node && ctrl.node.checkCount ?
            ' +' + getChecksCount(ctrl, player.color) : null
          }
        </div>
        {ctrl.data.clock && (!isCrazy || !isPortrait) ?
          <div className="analyseClock">
            {formatClockTime(ctrl.data.clock[player.color] * 1000, false)}
            <span className="fa fa-clock-o" />
          </div> : null
        }
        {isCrazy && ctrl.node && ctrl.node.crazyhouse ? h(CrazyPocket, {
          ctrl: { chessground: ctrl.chessground, canDrop: ctrl.canDrop },
          crazyData: ctrl.node.crazyhouse,
          color: player.color,
          position: 'top'
        }) : null}
      </div>
      <div className="analyseOpponent">
        <div className={'analysePlayerName' + (isCrazy ? ' crazy' : '')}>
          <span className={'color-icon ' + opponent.color} />
          {playerName(opponent, true)}
          {helper.renderRatingDiff(opponent)}
          { ctrl.data.game.variant.key === 'threeCheck' && ctrl.node && ctrl.node.checkCount ?
            ' +' + getChecksCount(ctrl, opponent.color) : null
          }
        </div>
        {ctrl.data.clock && (!isCrazy || !isPortrait) ?
          <div className="analyseClock">
            {formatClockTime(ctrl.data.clock[opponent.color] * 1000, false)}
            <span className="fa fa-clock-o" />
          </div> : null
        }
        {isCrazy && ctrl.node && ctrl.node.crazyhouse ? h(CrazyPocket, {
          ctrl: { chessground: ctrl.chessground, canDrop: ctrl.canDrop },
          crazyData: ctrl.node.crazyhouse,
          color: opponent.color,
          position: 'bottom'
        }) : null}
      </div>
      <div className="gameInfos">
        {ctrl.vm.formattedDate ? ctrl.vm.formattedDate : null}
        { ctrl.data.game.source === 'import' && ctrl.data.game.importedBy ?
          <div>Imported by {ctrl.data.game.importedBy}</div> : null
        }
      </div>
      {gameStatusApi.finished(ctrl.data) ? renderStatus(ctrl) : null}
    </div>
  )
}

function renderStatus(ctrl: AnalyseCtrl) {
  const winner = gameApi.getPlayer(ctrl.data, ctrl.data.game.winner)
  return (
    <div key="gameStatus" className="status">
      {gameStatusApi.toLabel(ctrl.data.game.status.name, ctrl.data.game.winner, ctrl.data.game.variant.key)}

      {winner ? '. ' + i18n(winner.color === 'white' ? 'whiteIsVictorious' : 'blackIsVictorious') + '.' : null}
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
