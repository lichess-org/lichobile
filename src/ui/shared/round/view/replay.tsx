import * as h from 'mithril/hyperscript'
import { fixCrazySan } from '../../../../utils/chessFormat'
import * as helper from '../../../helper'
import settings from '../../../../settings'
import OnlineRound from '../OnlineRound'

let pieceNotation: boolean

function autoScroll(movelist?: HTMLElement) {
  if (!movelist) return
  requestAnimationFrame(() => {
    const plyEl = movelist.querySelector('.current') as HTMLElement
    console.log(plyEl)
    if (plyEl) movelist.scrollTop = plyEl.offsetTop - movelist.offsetHeight / 2 + plyEl.offsetHeight / 2
  })
}

function getMoveEl(e: Event) {
  const target = (e.target as HTMLElement)
  return target.tagName === 'MOVE' ? target :
    helper.findParentBySelector(target, 'move')
}

function onReplayTap(ctrl: OnlineRound, e: Event) {
  const el = getMoveEl(e)
  if (el && el.dataset.ply) {
    ctrl.jump(Number(el.dataset.ply))
  }
}

export function renderTable(ctrl: OnlineRound) {
  const steps = ctrl.data.steps
  pieceNotation = pieceNotation === undefined ? settings.game.pieceNotation() : pieceNotation

  return (
    <div className="replay">
      <div className="gameMovesList native_scroller"
        oncreate={(vnode: Mithril.DOMNode) => {
          setTimeout(() => autoScroll(vnode.dom as HTMLElement), 100)
        }}
        onupdate={(vnode: Mithril.DOMNode) => autoScroll(vnode.dom as HTMLElement)}
      >
        <div className={'moves' + (pieceNotation ? ' displayPieces' : '')}
          oncreate={helper.ontap((e: Event) => onReplayTap(ctrl, e), undefined, undefined, getMoveEl)}
        >
            {
              steps.filter(s => s.san !== null).map(s => h('move.replayMove', {
                className: s.ply === ctrl.vm.ply ? 'current' : '',
                'data-ply': s.ply,
              }, [
                s.ply & 1 ? h('index', renderIndex(s.ply, true)) : null,
                fixCrazySan(s.san!)
              ]))
            }
        </div>
      </div>
    </div>
  )
}

function renderIndexText(ply: Ply, withDots?: boolean): string {
  return plyToTurn(ply) + (withDots ? (ply % 2 === 1 ? '.' : '...') : '')
}

function renderIndex(ply: Ply, withDots?: boolean): Mithril.Children {
  return h('index', renderIndexText(ply, withDots))
}

function plyToTurn(ply: number): number {
  return Math.floor((ply - 1) / 2) + 1
}

