import h from 'mithril/hyperscript'
import i18n, { i18nVdom } from '../../../i18n'
import { oppositeColor } from '../../../utils'
import { Tree } from '../../shared/tree'
import * as helper from '../../helper'
import AnalyseCtrl from '../AnalyseCtrl'
import { PracticeCtrl, Comment } from './practiceCtrl'

function commentBest(c: Comment, ctrl: PracticeCtrl): Mithril.Children {
  return c.best ? i18nVdom(
    c.verdict === 'goodMove' ? 'anotherWasX' : 'bestWasX',
    h('move', {
      oncreate: helper.ontap(ctrl.playCommentBest),
    },
    c.best.san)
  ) : []
}

function renderOffTrack(ctrl: PracticeCtrl): Mithril.Child {
  return h('div.analyse-training_player.off', [
    h('div.icon.off', '!'),
    h('div.analyse-training_box_instruction', [
      h('strong', i18n('youBrowsedAway')),
      h('div.choices', [
        h('button', {
          oncreate: helper.ontap(ctrl.resume)
        }, i18n('resumePractice'))
      ])
    ])
  ])
}

function renderEnd(root: AnalyseCtrl, ctrl: PracticeCtrl, end: string): Mithril.Child {
  const isMate = end === 'checkmate'
  const color = isMate ? oppositeColor(root.turnColor()) : root.turnColor()
  return h('div.analyse-training_player', [
    color ? h('div.piece-no-square', {
      className: ctrl.pieceTheme
    }, h('piece.king.' + color)) : h('div.icon.off', '!'),
    h('div.analyse-training_box_instruction', [
      h('strong', i18n(end)),
      isMate ?
        h('em', h('color', i18n(color === 'white' ? 'whiteWinsGame' : 'blackWinsGame'))) :
        h('em', i18n('theGameIsADraw'))
    ])
  ])
}

const minDepth = 8

function renderEvalProgress(node: Tree.Node, maxDepth: number): Mithril.Child {
  const width = node.ceval ?
    (100 * Math.max(0, node.ceval.depth - minDepth) / (maxDepth - minDepth)) + '%' :
    0
  return h('div.analyse-training_progress', h('div', { style: `width: ${width}` }))
}

function renderRunning(root: AnalyseCtrl, ctrl: PracticeCtrl): Mithril.Child {
  const hint = ctrl.hinting()
  return h('div.analyse-training_player.running', [
    h('div.piece-no-square', {
      className: ctrl.pieceTheme
    }, h('piece.king.' + root.turnColor())),
    h('div.analyse-training_box_instruction',
      (ctrl.isMyTurn() ? [h('strong', i18n('yourTurn'))] : [
        h('strong', i18n('computerThinking')),
        renderEvalProgress(ctrl.currentNode(), ctrl.playableDepth())
      ]).concat(h('div.choices', [
        ctrl.isMyTurn() ? h('button', {
          oncreate: helper.ontap(ctrl.hint),
        }, i18n(hint ? (hint.mode === 'piece' ? 'seeBestMove' : 'hideBestMove') : 'getAHint')) : ''
      ])))
  ])
}

function renderTitle(root: AnalyseCtrl, ctrl: PracticeCtrl): Mithril.Child {
  return h('div.titleWrapper', [
    h('div.title', i18n('practiceWithComputer')),
    h('div.actions', [
      h('button.window-button', {
        oncreate: helper.ontap(ctrl.toggleWindow)
      }, h('span.fa', {
        className: ctrl.minimized() ? 'fa-window-maximize' : 'fa-window-minimize'
      })),
      h('button.window-button', {
        oncreate: helper.ontap(root.togglePractice)
      }, h('span.fa.fa-window-close'))
    ])
  ])
}

export default function(root: AnalyseCtrl): Mithril.Child {
  const ctrl = root.practice
  if (!ctrl) return
  const comment: Comment | null = ctrl.comment()
  const running: boolean = ctrl.running()
  const end = ctrl.currentNode().threefold ? 'threefoldRepetition' : root.gameOver()
  return h('div.analyse-practice_box.analyse-training_box.box.' + (comment ? comment.verdict : 'no-verdict'), {
    className: ctrl.minimized() ? 'minimized' : ''
  }, [
    renderTitle(root, ctrl),
    h('div.analyse-training_feedback.native_scroller', !running ? renderOffTrack(ctrl) : (end ? renderEnd(root, ctrl, end) : renderRunning(root, ctrl))),
    running ? h('div.comment', comment ? ([
      h('span.verdict', i18n(comment.verdict)),
      ' '
    ] as Mithril.ChildArray).concat(commentBest(comment, ctrl)) : [ctrl.isMyTurn() || end ? '' : h('span.wait', i18n('evaluatingYourMove'))]) : (
      running ? h('div.comment') : null
    )
  ])
}
