import * as Mithril from 'mithril'
import h from 'mithril/hyperscript'
import i18n, { i18nVdom } from '../../../i18n'
import { oppositeColor } from '../../../utils'
import { Tree } from '../../shared/tree'
import AnalyseCtrl from '../AnalyseCtrl'
import { PracticeCtrl, Comment } from './practiceCtrl'

function commentBest(c: Comment, root: AnalyseCtrl, ctrl: PracticeCtrl): Mithril.Children {
  console.log(root, ctrl)
  return c.best ? i18nVdom(
    c.verdict === 'goodMove' ? 'anotherWasX' : 'bestWasX',
    h('move', {
    },
    c.best.san)
  ) : []
}

function renderOffTrack(root: AnalyseCtrl, ctrl: PracticeCtrl): Mithril.Child {
  console.log(root, ctrl)
  return h('div.player.off', [
    h('div.icon.off', '!'),
    h('div.instruction', [
      h('strong', i18n('youBrowsedAway')),
      h('div.choices', [
        h('button', {}, i18n('resumePractice'))
      ])
    ])
  ])
}

function renderEnd(root: AnalyseCtrl, end: string): Mithril.Child {
  const isMate = end === 'checkmate'
  const color = isMate ? oppositeColor(root.turnColor()) : root.turnColor()
  return h('div.player', [
    color ? h('div.no-square', h('piece.king.' + color)) : h('div.icon.off', '!'),
    h('div.instruction', [
      h('strong', i18n(end)),
      isMate ?
        h('em', h('color', i18n(color === 'white' ? 'whiteWinsGame' : 'blackWinsGame'))) :
        h('em', i18n('theGameIsADraw'))
    ])
  ])
}

const minDepth = 8

function renderEvalProgress(node: Tree.Node, maxDepth: number): Mithril.Child {
  return h('div.progress', h('div', {
    attrs: {
      style: `width: ${node.ceval ? (100 * Math.max(0, node.ceval.depth - minDepth) / (maxDepth - minDepth)) + '%' : 0}`
    }
  }))
}

function renderRunning(root: AnalyseCtrl, ctrl: PracticeCtrl): Mithril.Child {
  const hint = ctrl.hinting()
  return h('div.player.running', [
    h('div.no-square', h('piece.king.' + root.turnColor())),
    h('div.instruction',
      (ctrl.isMyTurn() ? [h('strong', i18n('yourTurn'))] : [
        h('strong', i18n('computerThinking')),
        renderEvalProgress(ctrl.currentNode(), ctrl.playableDepth())
      ]).concat(h('div.choices', [
        ctrl.isMyTurn() ? h('button', {
        }, i18n(hint ? (hint.mode === 'piece' ? 'seeBestMove' : 'hideBestMove') : 'getAHint')) : ''
      ])))
  ])
}

export default function(root: AnalyseCtrl): Mithril.Child {
  const ctrl = root.practice
  if (!ctrl) return
  const comment: Comment | null = ctrl.comment()
  const running: boolean = ctrl.running()
  const end = ctrl.currentNode().threefold ? 'threefoldRepetition' : root.gameOver()
  return h('div.practice-box.training-box.sub-box.' + (comment ? comment.verdict : 'no-verdict'), [
    h('div.title', i18n('practiceWithComputer')),
    h('div.feedback', !running ? renderOffTrack(root, ctrl) : (end ? renderEnd(root, end) : renderRunning(root, ctrl))),
    running ? h('div.comment', comment ? ([
      h('span.verdict', i18n(comment.verdict)),
      ' '
    ] as Mithril.ChildArray).concat(commentBest(comment, root, ctrl)) : [ctrl.isMyTurn() || end ? '' : h('span.wait', i18n('evaluatingYourMove'))]) : (
      running ? h('div.comment') : null
    )
  ])
}
