import h from 'mithril/hyperscript'
import i18n, { i18nVdom } from '../../../i18n'
import spinner from '../../../spinner'
import { Tree } from '../../shared/tree'
import * as helper from '../../helper'
import { renderIndexAndMove } from '../view/moveView'
import { Feedback, IRetroCtrl } from './RetroCtrl'
import AnalyseCtrl from '../AnalyseCtrl'

export default function retroView(root: AnalyseCtrl): Mithril.Child | undefined {
  const ctrl = root.retro
  if (!ctrl) return
  const fb = ctrl.vm.feedback
  return h('div.analyse-training_box.analyse-retro_box.box', {
    className: ctrl.vm.minimized ? 'minimized' : ''
  }, [
    renderTitle(ctrl),
    h('div.analyse-training_feedback.native_scroller.' + fb, renderFeedback(root, fb))
  ])
}

function skipOrViewSolution(ctrl: IRetroCtrl) {
  return h('div.choices', [
    h('button', {
      oncreate: helper.ontap(ctrl.viewSolution)
    }, i18n('viewTheSolution')),
    h('button', {
      oncreate: helper.ontap(ctrl.skip)
    }, i18n('skipThisMove'))
  ])
}

function jumpToNext(ctrl: IRetroCtrl) {
  return h('div.li-button.retro-half.retro-continue', {
    oncreate: helper.ontap(ctrl.jumpToNext)
  }, [
    h('i[data-icon=G]'),
    i18n('next')
  ])
}

const minDepth = 8
const maxDepth = 18

function renderEvalProgress(node: Tree.Node): Mithril.Child {
  return h('div.analyse-training_progress', h('div', {
    style: {
      width: `${node.ceval ? (100 * Math.max(0, node.ceval.depth - minDepth) / (maxDepth - minDepth)) + '%' : 0}`
    }
  }))
}

const feedback = {
  find(ctrl: IRetroCtrl): Mithril.Child[] {
    return [
      h('div.analyse-training_player', [
        h('div.piece-no-square', {
          className: ctrl.pieceTheme
        }, h('piece.king.' + ctrl.vm.color)),
        h('div.retro-instruction', [
          h('strong', [
            i18nVdom('xWasPlayed', h('span', renderIndexAndMove({
              withDots: true,
              showGlyphs: true,
              showEval: false
            }, ctrl.vm.current.fault.node)))
          ]),
          h('em', i18n(
            ctrl.vm.color === 'white' ?
              'findBetterMoveForWhite' :
              'findBetterMoveForBlack')),
          skipOrViewSolution(ctrl)
        ])
      ])
    ]
  },
  // user has browsed away from the move to solve
  offTrack(ctrl: IRetroCtrl): Mithril.Child[] {
    return [
      h('div.analyse-training_player', [
        h('div.retro-icon.off', '!'),
        h('div.retro-instruction', [
          h('strong', 'You browsed away'),
          h('div.choices.off', [
            h('button', {
              oncreate: helper.ontap(ctrl.jumpToNext)
            }, 'Resume learning')
          ])
        ])
      ])
    ]
  },
  fail(ctrl: IRetroCtrl): Mithril.Child[] {
    return [
      h('div.analyse-training_player', [
        h('div.retro-icon', '✗'),
        h('div.retro-instruction', [
          h('strong', i18n('youCanDoBetter')),
          h('em', i18n(
            ctrl.vm.color === 'white' ?
            'tryAnotherMoveForWhite' : 'tryAnotherMoveForBlack')
          ),
          skipOrViewSolution(ctrl)
        ])
      ])
    ]
  },
  win(ctrl: IRetroCtrl): Mithril.Child[] {
    return [
      h('div.retro-half.top',
        h('div.analyse-training_player', [
          h('div.retro-icon', '✓'),
          h('div.retro-instruction', h('strong', i18n('goodMove')))
        ])
      ),
      jumpToNext(ctrl)
    ]
  },
  view(ctrl: IRetroCtrl): Mithril.Child[] {
    return [
      h('div.retro-half.top',
        h('div.analyse-training_player', [
          h('div.retro-icon', '✓'),
          h('div.retro-instruction', [
            h('strong', i18n('solution')),
            h('em', [
              h('strong', renderIndexAndMove({
                withDots: true,
                showEval: false
              }, ctrl.vm.current.solution.node))
            ])
          ])
        ])
      ),
      jumpToNext(ctrl)
    ]
  },
  eval(ctrl: IRetroCtrl): Mithril.Child[] {
    return [
      h('div.retro-half.top',
        h('div.analyse-training_player.center', [
          h('div.retro-instruction', [
            h('strong', i18n('evaluatingYourMove')),
            renderEvalProgress(ctrl.node())
          ])
        ])
      )
    ]
  },
  end(ctrl: IRetroCtrl, hasFullComputerAnalysis: () => boolean): Mithril.Child[] {
    if (!hasFullComputerAnalysis()) return [
      h('div.retro-half.top',
        h('div.analyse-training_player', [
          h('div.retro-icon', spinner.getVdom()),
          h('div.retro-instruction', i18n('waitingForAnalysis'))
        ])
      )
    ]
    const nothing = !ctrl.completion()[1]
    return [
      h('div.analyse-training_player', [
        h('div.piece-no-square', {
          className: ctrl.pieceTheme
        }, h('piece.king.' + ctrl.vm.color)),
        h('div.retro-instruction', [
          h('em', nothing ?
            i18n(ctrl.vm.color === 'white' ?
              'noMistakesFoundForWhite' : 'noMistakesFoundForBlack'
            ) :
              i18n(ctrl.vm.color === 'white' ?
                'doneReviewingWhiteMistakes' : 'doneReviewingBlackMistakes'
              )
          ),
          h('div.choices.end', [
            nothing ? null : h('button', {
              oncreate: helper.ontap(ctrl.reset)
            }, i18n('doItAgain')),
            h('button', {
              oncreate: helper.ontap(ctrl.flip)
            }, i18n(ctrl.vm.color === 'white' ?
              'reviewBlackMistakes' : 'reviewWhiteMistakes'
            ))
          ])
        ])
      ])
    ]
  }
}

function renderFeedback(root: AnalyseCtrl, fb: Feedback) {
  const ctrl: IRetroCtrl = root.retro!
  const current = ctrl.vm.current
  if (ctrl.isSolving() && current && root.path !== current.prev.path) {
    return feedback.offTrack(ctrl)
  }
  if (fb === 'find') {
    return current ? feedback.find(ctrl) :
      feedback.end(ctrl, root.hasFullComputerAnalysis)
  }
  return feedback[fb](ctrl)
}

function renderTitle(ctrl: IRetroCtrl): Mithril.Child {
  const completion = ctrl.completion()
  return h('div.titleWrapper', [
    h('div.title', i18n('learnFromYourMistakes')),
    h('div.mistakeNb', Math.min(completion[0] + 1, completion[1]) + ' / ' + completion[1]),
    h('div.actions', [
      h('button.window-button', {
        oncreate: helper.ontap(ctrl.toggleWindow)
      }, h('span.fa', {
        className: ctrl.vm.minimized ? 'fa-window-maximize' : 'fa-window-minimize'
      })),
      h('button.window-button', {
        oncreate: helper.ontap(ctrl.close)
      }, h('span.fa.fa-window-close'))
    ])
  ])
}
