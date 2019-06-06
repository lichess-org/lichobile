import * as h from 'mithril/hyperscript'
import * as chessFormat from '../../../utils/chessFormat'
import gameStatusApi from '../../../lichess/status'
import { findTag, gameResult } from '../../../lichess/interfaces/study'
import Board, { Bounds } from '../../shared/Board'
import { Shape } from '../../shared/BoardBrush'
import * as treeOps from '../../shared/tree/ops'

import Clock from './Clock'
import { Tab } from '../tabs'
import { povDiff } from '../ceval/winningChances'
import AnalyseCtrl from '../AnalyseCtrl'

export default function renderBoard(
  ctrl: AnalyseCtrl,
  bounds: Bounds,
  availTabs: ReadonlyArray<Tab>
) {
  const curTab = ctrl.currentTab(availTabs)
  const player = ctrl.data.game.player
  const ceval = ctrl.node && ctrl.node.ceval
  const rEval = ctrl.node && ctrl.node.eval

  let nextBest: string | undefined
  let curBestShapes: Shape[] = []
  if (!ctrl.retro && ctrl.settings.s.showBestMove) {
    nextBest = ctrl.nextNodeBest() || (ceval && ceval.best)
    if (nextBest) {
      curBestShapes = moveOrDropShape(nextBest, 'paleBlue', player)
    }
    if (ceval && ceval.pvs.length > 1) {
      ceval.pvs.slice(1).forEach(pv => {
        const shift = povDiff(player, ceval.pvs[0], pv)
        if (shift >= 0 && shift < 0.2) {
          const linewidth = Math.round(12 - shift * 50) // 12 to 2
          curBestShapes = curBestShapes.concat(moveOrDropShape(pv.moves[0], 'paleBlue' + linewidth, player))
        }
      })
    }
  }
  const pastBestShape: Shape[] = !ctrl.retro && rEval && rEval.best ?
    moveOrDropShape(rEval.best, 'paleGreen', player) : []

  const nextUci = curTab.id === 'explorer' && ctrl.node && treeOps.withMainlineChild(ctrl.node, n => n.uci)

  const nextMoveShape: Shape[] = nextUci ?
    moveOrDropShape(nextUci, 'palePurple', player) : []

  const badNode = ctrl.retro && ctrl.retro.showBadNode()
  const badMoveShape: Shape[] = badNode && badNode.uci ?
    moveOrDropShape(badNode.uci, 'paleRed', player) : []

  const shapes = [
    ...nextMoveShape, ...pastBestShape, ...curBestShapes, ...badMoveShape
  ]

  return h('div.analyse-boardWrapper', {
    key: ctrl.settings.s.smallBoard ? 'board-small' : 'board-full',
  }, [
    playerBar(ctrl, ctrl.topColor()),
    h(Board, {
      variant: ctrl.data.game.variant.key,
      chessground: ctrl.chessground,
      bounds,
      shapes,
      clearableShapes: ctrl.node.shapes,
      wrapperClasses: ctrl.settings.s.smallBoard ? 'halfsize' : '',
      canClearShapes: true,
    }),
    playerBar(ctrl, ctrl.bottomColor()),
  ])
}

export function playerBar(ctrl: AnalyseCtrl, color: Color) {
  const pName = ctrl.playerName(color)
  if (pName === 'Anonymous') return null

  const study = ctrl.study && ctrl.study.data
  let title, elo, result: string | undefined
  if (study) {
    title = findTag(study, `${color}title`)
    elo = findTag(study, `${color}elo`)
    result = gameResult(study, color === 'white')
  } else if (gameStatusApi.finished(ctrl.data)) {
    const winner = ctrl.data.game.winner
    result = winner === undefined ? '½' : winner === color ? '1' : '0'
  }
  const checkCount = ctrl.node.checkCount
  const showRight = ctrl.node.clock || checkCount
  return h('div.analyse-player_bar', {
    className: ctrl.settings.s.smallBoard ? 'halfsize' : ''
  }, [
    h('div.info', [
      result ? h('span.result', result) : null,
      h('span.name', (title ? title + ' ' : '') + pName + (elo ? ` (${elo})` : '')),
    ]),
    showRight ? h('div.player_bar_clock', [
      h(Clock, { ctrl, color }),
      checkCount ? renderCheckCount(ctrl.bottomColor() === 'white', checkCount) : null
    ]) : null,
  ])
}

function renderCheckCount(whitePov: boolean, checkCount: { white: number, black: number }) {
  const w = h('span.color-icon.white', '+' + checkCount.black)
  const b = h('span.color-icon.black', '+' + checkCount.white)
  return h('div.analyse-checkCount', whitePov ? [w, b] : [b, w])
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
