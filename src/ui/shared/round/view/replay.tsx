import * as helper from '../../../helper'
import settings from '../../../../settings'
import { GameStep } from '../../../../lichess/interfaces/game'
import OnlineRound from '../OnlineRound'

type StepPair = [GameStep | null, GameStep | null]

const emptyTd = <td className="move">...</td>
let pieceNotation: boolean

function renderTd(step: GameStep | null, curPly: number, orEmpty: boolean) {
  if (!step || !step.san) return (orEmpty ? emptyTd : null)

  const san = step.san[0] === 'P' ? step.san.slice(1) : step.san

  return (
    <td className={'replayMove' + (step.ply === curPly ? ' current' : '')}
      data-ply={step.ply}
    >
      {san}
    </td>
  )
}

function renderTr(index: number, pairs: StepPair[], curPly: number) {
  const first = pairs[index][0]
  const second = pairs[index][1]
  return (
    <tr>
      <td className="replayMoveIndex">{ (index + 1) + '.' }</td>
      {renderTd(first, curPly, true)}
      {renderTd(second, curPly, false)}
    </tr>
  )
}

function autoScroll(movelist?: HTMLElement) {
  if (!movelist) return
  const plyEl = movelist.querySelector('.current') as HTMLElement || movelist.querySelector('tr:first-child') as HTMLElement
  if (plyEl) movelist.scrollTop = plyEl.offsetTop - movelist.offsetHeight / 2 + plyEl.offsetHeight / 2
}

function getTdEl(e: Event) {
  return e.target as HTMLElement
}

function onTableTap(ctrl: OnlineRound, e: Event) {
  const ply = (e.target as HTMLElement).dataset.ply
  if (ply) ctrl.jump(Number(ply))
}

export function renderTable(ctrl: OnlineRound) {
  const steps = ctrl.data.steps
  const firstPly = ctrl.firstPly()

  const pairs: StepPair[] = []
  if (firstPly % 2 === 0) {
    for (let i = 1, len = steps.length; i < len; i += 2)
      pairs.push([steps[i], steps[i + 1]])
  } else {
    pairs.push([null, steps[1]])
    for (let i = 2, len = steps.length; i < len; i += 2)
      pairs.push([steps[i], steps[i + 1]])
  }

  const trs = []
  for (let i = 0, len = pairs.length; i < len; i++)
    trs.push(renderTr(i, pairs, ctrl.vm.ply))
  pieceNotation = pieceNotation === undefined ? settings.game.pieceNotation() : pieceNotation

  return (
    <div className="replay">
      <div className="gameMovesList native_scroller"
        oncreate={(vnode: Mithril.DOMNode) => {
          setTimeout(() => autoScroll(vnode.dom as HTMLElement), 100)
        }}
        onupdate={(vnode: Mithril.DOMNode) => autoScroll(vnode.dom as HTMLElement)}
      >
        <table className={'moves' + (pieceNotation ? ' displayPieces' : '')}
          oncreate={helper.ontap((e: Event) => onTableTap(ctrl, e), undefined, undefined, getTdEl)}
        >
          <tbody>
            {trs}
          </tbody>
        </table>
      </div>
    </div>
  )
}
