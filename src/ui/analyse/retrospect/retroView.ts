import * as h from 'mithril/hyperscript'
import i18n from '../../../i18n'
import { oppositeColor } from '../../../utils'
import spinner from '../../../spinner'
import { Tree } from '../../shared/tree'
import * as helper from '../../helper'
import { renderIndexAndMove } from '../view/moveView'
import { Feedback, IRetroCtrl } from './RetroCtrl'
import AnalyseCtrl from '../AnalyseCtrl'

export default function retroView(root: AnalyseCtrl): Mithril.BaseNode | undefined {
  const ctrl = root.retro
  if (!ctrl) return
  const fb = ctrl.vm.feedback
  return h('div.analyse-retro_box', {
    className: ctrl.vm.minimized ? 'minimized' : ''
  }, [
    renderTitle(ctrl),
    h('div.retro-feedback.native_scroller.' + fb, renderFeedback(root, fb))
  ])
}

function skipOrViewSolution(ctrl: IRetroCtrl) {
  return h('div.choices', [
    h('button', {
      oncreate: helper.ontap(ctrl.viewSolution)
    }, i18n('viewTheSolution')),
    h('button', {
      oncreate: helper.ontap(ctrl.skip)
    }, 'Skip this move')
  ])
}

function jumpToNext(ctrl: IRetroCtrl) {
  return h('div.li-button.retro-half.retro-continue', {
    oncreate: helper.ontap(ctrl.jumpToNext)
  }, [
    h('i[data-icon=G]'),
    'Next'
  ])
}

const minDepth = 8
const maxDepth = 18

function renderEvalProgress(node: Tree.Node): Mithril.BaseNode {
  return h('div.retro-progress', h('div', {
    style: {
      width: `${node.ceval ? (100 * Math.max(0, node.ceval.depth - minDepth) / (maxDepth - minDepth)) + '%' : 0}`
    }
  }))
}

const feedback = {
  find(ctrl: IRetroCtrl): Mithril.BaseNode[] {
    return [
      h('div.retro-player', [
        h('div.piece-no-square', {
          className: ctrl.pieceTheme
        }, h('piece.king.' + ctrl.vm.color)),
        h('div.retro-instruction', [
          h('strong', [
            ...renderIndexAndMove({
              withDots: true,
              showGlyphs: true,
              showEval: false
            }, ctrl.vm.current.fault.node),
            ' was played'
          ]),
          h('em', 'Find a better move for ' + ctrl.vm.color),
          skipOrViewSolution(ctrl)
        ])
      ])
    ]
  },
  // user has browsed away from the move to solve
  offTrack(ctrl: IRetroCtrl): Mithril.BaseNode[] {
    return [
      h('div.retro-player', [
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
  fail(ctrl: IRetroCtrl): Mithril.BaseNode[] {
    return [
      h('div.retro-player', [
        h('div.retro-icon', '✗'),
        h('div.retro-instruction', [
          h('strong', 'You can do better'),
          h('em', 'Try another move for ' + ctrl.vm.color),
          skipOrViewSolution(ctrl)
        ])
      ])
    ]
  },
  win(ctrl: IRetroCtrl): Mithril.BaseNode[] {
    return [
      h('div.retro-half.top',
        h('div.retro-player', [
          h('div.retro-icon', '✓'),
          h('div.retro-instruction', h('strong', i18n('goodMove')))
        ])
      ),
      jumpToNext(ctrl)
    ]
  },
  view(ctrl: IRetroCtrl): Mithril.BaseNode[] {
    return [
      h('div.retro-half.top',
        h('div.retro-player', [
          h('div.retro-icon', '✓'),
          h('div.retro-instruction', [
            h('strong', 'Solution:'),
            h('em', [
              'Best move was ',
              h('strong', renderIndexAndMove({
                withDots: true,
                showEval: false
              }, ctrl.vm.current.solution.node)
              )
            ])
          ])
        ])
      ),
      jumpToNext(ctrl)
    ]
  },
  eval(ctrl: IRetroCtrl): Mithril.BaseNode[] {
    return [
      h('div.retro-half.top',
        h('div.retro-player.center', [
          h('div.retro-instruction', [
            h('strong', 'Evaluating your move'),
            renderEvalProgress(ctrl.node())
          ])
        ])
      )
    ]
  },
  end(ctrl: IRetroCtrl, hasFullComputerAnalysis: () => boolean): Mithril.BaseNode[] {
    if (!hasFullComputerAnalysis()) return [
      h('div.retro-half.top',
        h('div.retro-player', [
          h('div.retro-icon', spinner.getVdom()),
          h('div.retro-instruction', 'Waiting for analysis...')
        ])
      )
    ]
    const nothing = !ctrl.completion()[1]
    return [
      h('div.retro-player', [
        h('div.piece-no-square', {
          className: ctrl.pieceTheme
        }, h('piece.king.' + ctrl.vm.color)),
        h('div.retro-instruction', [
          h('em', nothing ?
            'No mistakes found for ' + ctrl.vm.color :
            'Done reviewing ' + ctrl.vm.color + ' mistakes'),
          h('div.choices.end', [
            nothing ? null : h('button', {
              oncreate: helper.ontap(ctrl.reset)
            }, 'Do it again'),
            h('button', {
              oncreate: helper.ontap(ctrl.flip)
            }, 'Review ' + oppositeColor(ctrl.vm.color) + ' mistakes')
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

function renderTitle(ctrl: IRetroCtrl): Mithril.BaseNode {
  const completion = ctrl.completion()
  return h('div.title', [
    h('span', 'Learn from your mistakes'),
    h('span', Math.min(completion[0] + 1, completion[1]) + ' / ' + completion[1]),
    h('div.retro-actions', [
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
