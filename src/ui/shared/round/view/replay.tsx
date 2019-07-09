import * as h from 'mithril/hyperscript'
import { fixCrazySan } from '../../../../utils/chessFormat'
import * as helper from '../../../helper'
import settings from '../../../../settings'
import OnlineRound from '../OnlineRound'

let pieceNotation: boolean

export function renderReplay(ctrl: OnlineRound) {
  pieceNotation = pieceNotation === undefined ? settings.game.pieceNotation() : pieceNotation
  return h('div.replay', {
    className: pieceNotation ? ' displayPieces' : '',
    oncreate: (vnode: Mithril.DOMNode) => {
      setTimeout(() => autoScroll(vnode.dom as HTMLElement), 100)
      helper.ontapY((e: Event) => onReplayTap(ctrl, e), undefined, getMoveEl)(vnode)
    },
    onupdate: (vnode: Mithril.DOMNode) => autoScroll(vnode.dom as HTMLElement),
  }, renderMoves(ctrl))
}

export function renderInlineReplay(ctrl: OnlineRound) {
  pieceNotation = pieceNotation === undefined ? settings.game.pieceNotation() : pieceNotation
  return h('div.replay_inline', {
    className: pieceNotation ? ' displayPieces' : '',
    oncreate: (vnode: Mithril.DOMNode) => {
      setTimeout(() => autoScrollInline(vnode.dom as HTMLElement), 100)
      helper.ontapX((e: Event) => onReplayTap(ctrl, e), undefined, getMoveEl)(vnode)
    },
    onupdate: (vnode: Mithril.DOMNode) => autoScrollInline(vnode.dom as HTMLElement),
  }, renderMoves(ctrl))
}

function renderMoves(ctrl: OnlineRound) {
  return ctrl.data.steps.filter(s => s.san !== null).map(s => h('move.replayMove', {
    className: s.ply === ctrl.vm.ply ? 'current' : '',
    'data-ply': s.ply,
  }, [
    s.ply & 1 ? renderIndex(s.ply, true) : null,
    fixCrazySan(s.san!)
  ]))
}

function autoScroll(movelist?: HTMLElement) {
  if (!movelist) return
  requestAnimationFrame(() => {
    const plyEl = movelist.querySelector('.current') as HTMLElement
    if (plyEl) movelist.scrollTop = plyEl.offsetTop - movelist.offsetHeight / 2 + plyEl.offsetHeight / 2
  })
}

function autoScrollInline(movelist?: HTMLElement) {
  if (!movelist) return
  requestAnimationFrame(() => {
    const plyEl = movelist.querySelector('.current') as HTMLElement
    if (plyEl) movelist.scrollLeft = plyEl.offsetLeft - movelist.offsetWidth / 2 + plyEl.offsetWidth / 2
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

function renderIndexText(ply: Ply, withDots?: boolean): string {
  return plyToTurn(ply) + (withDots ? (ply % 2 === 1 ? '.' : '...') : '')
}

function renderIndex(ply: Ply, withDots?: boolean): Mithril.Children {
  return h('index', renderIndexText(ply, withDots))
}

function plyToTurn(ply: number): number {
  return Math.floor((ply - 1) / 2) + 1
}

