import * as h from 'mithril/hyperscript'
import { flatten, noNull } from '../../../utils'
import * as chessFormat from '../../../utils/chessFormat'
import Board from '../../shared/Board'
import { Shape } from '../../shared/BoardBrush'
import * as treeOps from '../../shared/tree/ops'

import { Tab } from '../tabs'
import AnalyseCtrl from '../AnalyseCtrl'

export default function renderBoard(
  ctrl: AnalyseCtrl,
  bounds: ClientRect,
  availTabs: Tab[]
) {
  const curTab = ctrl.currentTab(availTabs)
  const player = ctrl.data.game.player
  const ceval = ctrl.node && ctrl.node.ceval
  const rEval = ctrl.node && ctrl.node.eval

  let nextBest: string | undefined
  let curBestShape: Shape[] = []
  if (curTab.id !== 'explorer' && !ctrl.retro && ctrl.settings.s.showBestMove) {
    nextBest = ctrl.nextNodeBest()
    curBestShape = nextBest ? moveOrDropShape(nextBest, 'paleBlue', player) :
      ceval && ceval.best ? moveOrDropShape(ceval.best, 'paleBlue', player) :
      []
  }
  const pastBestShape = !ctrl.retro && rEval && rEval.best ?
    moveOrDropShape(rEval.best, 'paleGreen', player) : []

  const nextUci = curTab.id === 'explorer' && ctrl.node && treeOps.withMainlineChild(ctrl.node, n => n.uci)

  const nextMoveShape: Shape[] = nextUci ?
    moveOrDropShape(nextUci, 'palePurple', player) : []

  const badNode = ctrl.retro && ctrl.retro.showBadNode()
  const badMoveShape: Shape[] = badNode && badNode.uci ?
    moveOrDropShape(badNode.uci, 'paleRed', player) : []

  const shapes: Shape[] = nextMoveShape.length > 0 ?
  nextMoveShape : flatten([pastBestShape, curBestShape, badMoveShape].filter(noNull))

  return h(Board, {
    key: ctrl.settings.s.smallBoard ? 'board-small' : 'board-full',
    variant: ctrl.data.game.variant.key,
    chessground: ctrl.chessground,
    bounds,
    shapes,
    wrapperClasses: ctrl.settings.s.smallBoard ? 'halfsize' : ''
  })
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
