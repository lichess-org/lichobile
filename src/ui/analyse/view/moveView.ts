import h from 'mithril/hyperscript'
import { fixCrazySan } from '../../../utils/chessFormat'
import { Tree } from '../../shared/tree'
import { renderEval as normalizeEval, getBestEval } from '../util'

export interface Ctx {
  withDots?: boolean
  showEval: boolean
  showGlyphs?: boolean
}

function plyToTurn(ply: Ply): number {
  return Math.floor((ply - 1) / 2) + 1
}

export function renderGlyphs(glyphs: Tree.Glyph[]): Mithril.Vnode<any, any>[] {
  return glyphs.map(glyph => h('glyph', {
    title: glyph.name,
  }, glyph.symbol))
}

function renderEval(e: string): Mithril.Vnode<any, any> {
  return h('eval', e)
}

export function renderIndexText(ply: Ply, withDots?: boolean): string {
  return plyToTurn(ply) + (withDots ? (ply % 2 === 1 ? '.' : '...') : '')
}

export function renderIndex(ply: Ply, withDots?: boolean): Mithril.Vnode<any, any> {
  return h('index', renderIndexText(ply, withDots))
}

export function renderMove(ctx: Ctx, node: Tree.Node): Mithril.Vnode<any, any>[] {
  const ev: any = getBestEval({client: node.ceval, server: node.eval}) || {}
  return [h('san', fixCrazySan(node.san!))]
    .concat((node.glyphs && ctx.showGlyphs) ? renderGlyphs(node.glyphs) : [])
    .concat(ctx.showEval ? (
      ev.cp !== undefined ? [renderEval(normalizeEval(ev.cp))] : (
        ev.mate !== undefined ? [renderEval('#' + ev.mate)] : []
      )
    ) : [])
}

export function renderIndexAndMove(ctx: Ctx, node: Tree.Node): Mithril.Child[] {
  return node.uci ?
  [renderIndex(node.ply, ctx.withDots)].concat(renderMove(ctx, node)) :
  [h('span.init', 'Initial position')]
}
