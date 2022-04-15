import h from 'mithril/hyperscript'
import { fixCrazySan } from '../../../utils/chessFormat'
import * as gameApi from '../../../lichess/game'
import { Glyph } from '../../../lichess/interfaces/analyse'
import { ops as treeOps, path as treePath, Tree } from '../../shared/tree'
import * as helper from '../../helper'
import { plyToTurn, empty } from '../util'

import AnalyseCtrl from '../AnalyseCtrl'
import RichText from './richTextView'

type MaybeVNode = Mithril.Child | null

export interface Ctx {
  ctrl: AnalyseCtrl
  showComputer: boolean
  showGlyphs: boolean
  showEval: boolean
  truncateComments: boolean
}

export interface Opts {
  parentPath: Tree.Path
  isMainline: boolean
  inline?: Tree.Node
  withIndex?: boolean
  truncate?: number
}

export interface NodeClasses {
  current: boolean
  currentPlayable: boolean
  nongame: boolean
  [key: string]: boolean
}

// number of plies to show in variation lines
const LINES_PLIES = 6

export default function renderTree(ctrl: AnalyseCtrl): Mithril.Children {
  const root = ctrl.tree.root
  const ctx: Ctx = {
    ctrl,
    truncateComments: false,
    showComputer: ctrl.settings.s.showComments,
    showGlyphs: true,
    showEval: true
  }
  const commentTags = renderInlineCommentsOf(ctx, root)
  return h('div.analyse-moveList', {
    className: window.deviceInfo.platform === 'ios' ? 'ios' : ''
  }, [
    commentTags,
    renderChildrenOf(ctx, root, {
      parentPath: '',
      isMainline: true
    }) || []
  ])
}

function renderInlineCommentsOf(ctx: Ctx, node: Tree.Node): MaybeVNode[] {
  if (!ctx.ctrl.settings.s.showComments || empty(node.comments)) return []
  return node.comments!.map(comment => {
    if (comment.by === 'lichess' && !ctx.showComputer) return null
    return h('comment', h(RichText, {text: comment.text}))
  }).filter(x => !!x)
}

function renderChildrenOf(ctx: Ctx, node: Tree.Node, opts: Opts): MaybeVNode[] | null {
  const cs = node.children
  const main = cs[0]
  if (!main) return null
  if (opts.isMainline) {
    if (!cs[1]) return renderMoveAndChildrenOf(ctx, main, {
      parentPath: opts.parentPath,
      isMainline: true,
      withIndex: opts.withIndex
    })
    return renderInlined(ctx, cs, opts) || ([
      renderMoveOf(ctx, main, {
        parentPath: opts.parentPath,
        isMainline: true,
        withIndex: opts.withIndex
      }),
      renderInlineCommentsOf(ctx, main),
      h('interrupt', renderLines(ctx, cs.slice(1), {
        parentPath: opts.parentPath,
        isMainline: true
      })),
      renderChildrenOf(ctx, main, {
        parentPath: opts.parentPath + main.id,
        isMainline: true,
        withIndex: true
      }) || []
    ] as MaybeVNode[])
  }
  if (!cs[1]) return renderMoveAndChildrenOf(ctx, main, opts)
  return renderInlined(ctx, cs, opts) || [renderLines(ctx, cs, opts)]
}

function renderInlined(ctx: Ctx, nodes: Tree.Node[], opts: Opts): MaybeVNode[] | null {
  // only 2 branches
  if (!nodes[1] || nodes[2]) return null
  // only if second branch has no sub-branches
  if (treeOps.hasBranching(nodes[1], 6)) return null
  return renderMoveAndChildrenOf(ctx, nodes[0], {
    parentPath: opts.parentPath,
    isMainline: opts.isMainline,
    inline: nodes[1]
  })
}

function renderLines(ctx: Ctx, nodes: Tree.Node[], opts: Opts): Mithril.Child {
  return h('lines', nodes.map(n => {
    return h('line', renderMoveAndChildrenOf(ctx, n, {
      parentPath: opts.parentPath,
      isMainline: false,
      withIndex: true,
      truncate: n.comp && !treePath.contains(ctx.ctrl.path, opts.parentPath + n.id) ? LINES_PLIES : undefined
    }))
  }))
}

function renderMoveAndChildrenOf(ctx: Ctx, node: Tree.Node, opts: Opts): MaybeVNode[] {
  const path = opts.parentPath + node.id,
  comments = renderInlineCommentsOf(ctx, node)
  if (opts.truncate === 0) return [
    h('move', { 'data-path': path }, '[...]')
  ]
  return ([renderMoveOf(ctx, node, opts)] as MaybeVNode[])
    .concat(comments)
    .concat(opts.inline ? renderInline(ctx, opts.inline, opts) : null)
    .concat(renderChildrenOf(ctx, node, {
      parentPath: path,
      isMainline: opts.isMainline,
      truncate: opts.truncate ? opts.truncate - 1 : undefined,
      withIndex: !!comments[0]
    }) || [])
}

function renderInline(ctx: Ctx, node: Tree.Node, opts: Opts): Mithril.Child {
  return h('inline', renderMoveAndChildrenOf(ctx, node, {
    withIndex: true,
    parentPath: opts.parentPath,
    isMainline: false
  }))
}

function nodeClasses(ctx: Ctx, node: Tree.Node, path: Tree.Path): NodeClasses {
  const ctrl = ctx.ctrl
  const currentPlayable = !ctrl.study && (path === ctrl.initialPath && gameApi.playable(ctrl.data))
  const glyphIds = ctx.showGlyphs && node.glyphs ? node.glyphs.map(g => g.id) : []
  return {
    current: path === ctrl.path,
    currentPlayable,
    nongame: !currentPlayable && !!ctrl.gamePath && treePath.contains(path, ctrl.gamePath) && path !== ctrl.gamePath,
    inaccuracy: glyphIds.includes(6),
    mistake: glyphIds.includes(2),
    blunder: glyphIds.includes(4),
  }
}

function renderGlyphs(glyphs: Glyph[]): Mithril.Child[] {
  return glyphs.map(glyph => h('glyph', glyph.symbol))
}

function renderIndexText(ply: Ply, withDots?: boolean): string {
  return plyToTurn(ply) + (withDots ? (ply % 2 === 1 ? '.' : '...') : '')
}

function renderIndex(ply: Ply, withDots?: boolean): Mithril.Children {
  return h('index', renderIndexText(ply, withDots))
}

function renderMoveOf(ctx: Ctx, node: Tree.Node, opts: Opts): Mithril.Child {
  const path = opts.parentPath + node.id
  const content: Mithril.Children = [
    opts.withIndex || node.ply & 1 ? renderIndex(node.ply, true) : null,
    fixCrazySan(node.san!)
  ]
  if (node.glyphs) renderGlyphs(node.glyphs).forEach(g => content.push(g))
  return h('move', {
    'data-path': path,
    className: helper.classSet(nodeClasses(ctx, node, path))
  }, content)
}

