import * as h from 'mithril/hyperscript'
import i18n from '../../i18n'
import Board from '../shared/Board'
import { view as renderPromotion } from '../shared/offlineRound/promotion'
import { header, connectingHeader } from '../shared/common'
import * as helper from '../helper'

import menu from './menu'
import TrainingCtrl from './TrainingCtrl'


export function renderHeader(ctrl: TrainingCtrl) {
  return ctrl.vm.loading ?
  connectingHeader() : header(h('div.main_header_title.withSub', [
    h('h1', i18n('puzzleId', ctrl.data.puzzle.id)),
    h('h2.header-subTitle', [
      i18n('rating'), ' ' + (ctrl.vm.mode === 'view' ? ctrl.data.puzzle.rating : '?'),
      ' • ', i18n('playedXTimes', ctrl.data.puzzle.attempts)
    ])
  ]))
}

export function renderContent(ctrl: TrainingCtrl, key: string, bounds: ClientRect) {
  const board = h(Board, {
    variant: ctrl.data.game.variant.key,
    bounds,
    chessground: ctrl.chessground
  })

  return h.fragment({ key }, [
    board,
    h('div.training-tableWrapper', [
      h('div.training-table.native_scroller',
        ctrl.vm.mode === 'view' ? renderResult(ctrl) : renderFeedback(ctrl)
      ),
      renderActionsBar(ctrl)
    ])
  ])
}

export function overlay(ctrl: TrainingCtrl) {
  return [
    renderPromotion(ctrl),
    menu.view(ctrl.menu)
  ]
}

function renderActionsBar(ctrl: TrainingCtrl) {
  return h('section#training_actions.actions_bar', [
    h('button.action_bar_button.training_action.fa.fa-ellipsis-h', {
      key: 'puzzleMenu',
      oncreate: helper.ontap(ctrl.menu.open)
    }),
    h('button.action_bar_button.training_action.fa.fa-share-alt', {
      key: 'sharePuzzle',
      oncreate: helper.ontap(ctrl.share, () => window.plugins.toast.show('Share this puzzle', 'short', 'bottom'))
    }),
    h('button.action_bar_button.training_action[data-icon=A]', {
      key: 'analysePuzzle',
      oncreate: helper.ontap(ctrl.goToAnalysis, () => window.plugins.toast.show(i18n('analysis'), 'short', 'bottom')),
      disabled: ctrl.vm.mode !== 'view'
    }),
    h('button.action_bar_button.training_action.fa.fa-backward', {
      oncreate: helper.ontap(ctrl.rewind, undefined, ctrl.rewind),
      key: 'historyPrev',
      disabled: !ctrl.canGoBackward()
    }),
    h('button.action_bar_button.training_action.fa.fa-forward', {
      oncreate: helper.ontap(ctrl.fastforward, undefined, ctrl.fastforward),
      key: 'historyNext',
      disabled: !ctrl.canGoForward()
    })
  ])
}

function renderViewControls(ctrl: TrainingCtrl) {
  return [
    h('div.li-button.training-control.retry', {
      oncreate: helper.ontap(ctrl.retry)
    }, [h('span.fa.fa-refresh'), i18n('retryThisPuzzle')]),
    h('div.li-button.training-control.continue', {
      oncreate: helper.ontap(ctrl.newPuzzle.bind(ctrl, true))
    }, [h('span.fa.fa-play'), i18n('continueTraining')])
  ]
}

function renderFeedback(ctrl: TrainingCtrl) {

  switch (ctrl.vm.lastFeedback) {
    case 'init':
      return h('div.training-explanation', [
        h('div.player', [
          h('div.piece-no-square', {
            className: ctrl.pieceTheme
          }, h('piece.king.' + ctrl.data.puzzle.color)),
          h('div.training-instruction', [
            h('strong', i18n('yourTurn')),
            h('p', i18n(ctrl.data.puzzle.color === 'white' ? 'findTheBestMoveForWhite' : 'findTheBestMoveForBlack')),
          ])
        ]),
        renderViewSolution(ctrl)
      ])
    case 'retry':
      return h('div.training-explanation', [
        h('div.player', [
          h('div.training-icon', '!'),
          h('div.training-instruction', [
            h('strong', i18n('goodMove')),
            h('span', i18n('butYouCanDoBetter'))
          ]),
        ]),
        renderViewSolution(ctrl)
      ])
    case 'good':
      return h('div.training-explanation', [
        h('div.player', [
          h('div.training-icon.win', '✓'),
          h('div.training-instruction', [
            h('strong', i18n('bestMove')),
            h('span', i18n('keepGoing'))
          ]),
        ]),
        renderViewSolution(ctrl)
      ])
    case 'fail':
      return h('div.training-explanation', [
        h('div.player', [
          h('div.training-icon.loss', '✗'),
          h('div.training-instruction', [
            h('strong', i18n('puzzleFailed')),
            h('span', i18n('butYouCanKeepTrying'))
          ])
        ]),
        renderViewSolution(ctrl)
      ])
  }

}

function renderViewSolution(ctrl: TrainingCtrl) {
  return ctrl.vm.canViewSolution ? h('button.fatButton', {
    oncreate: (vnode: Mithril.DOMNode) => {
      helper.elFadeIn(vnode.dom as HTMLElement, 1500, '0', '0.8')
      helper.ontap(ctrl.viewSolution)(vnode)
    }
  }, i18n('viewTheSolution')) : h('div.buttonPlaceholder', '')
}

function renderResult(ctrl: TrainingCtrl) {
  if (ctrl.vm.lastFeedback === 'win') {
    return [
      h('div.training-half', [
        h('div.training-icon.win', '✓'),
        h('strong', [i18n('victory')])
      ]),
      h('div.training-half', renderViewControls(ctrl))
    ]
  }
  else {
    return [
      h('div.training-half', [
        h('strong', 'Puzzle complete!')
      ]),
      h('div.training-half', renderViewControls(ctrl))
    ]
  }
}
