import h from 'mithril/hyperscript'
import { Toast } from '@capacitor/toast'
import i18n, { plural } from '../../i18n'
import { hasNetwork } from '../../utils'
import session from '../../session'
import settings from '../../settings'
import Board from '../shared/Board'
import { view as renderPromotion } from '../shared/offlineRound/promotion'
import { header, connectingHeader } from '../shared/common'
import * as helper from '../helper'

import menu from './menu'
import TrainingCtrl from './TrainingCtrl'


export function renderHeader(ctrl: TrainingCtrl): Mithril.Children {
  const maxPuzzles = settings.training.puzzleBufferLen

  return ctrl.vm.loading ?
  connectingHeader() : header(h('div.main_header_title.withSub', [
    h('h1', i18n('puzzleId', ctrl.data.puzzle.id)),
    h('h2.header-subTitle', ([
      i18n('rating'), ' ' + (ctrl.vm.mode === 'view' ? ctrl.data.puzzle.rating : '?'),
      ' • ', plural('playedXTimes', ctrl.data.puzzle.attempts)
    ] as Mithril.Child[]).concat(!hasNetwork() ? [
      ' • ',
      h('span.fa.fa-database'),
      `${ctrl.nbUnsolved}/${maxPuzzles}`
    ] : [])),
  ]))
}

export function renderContent(ctrl: TrainingCtrl, key: string): Mithril.Vnode {
  const board = h(Board, {
    variant: ctrl.data.game.variant.key,
    chessground: ctrl.chessground
  })

  return h.fragment({ key }, [
    board,
    h('div.table.training-tableWrapper', [
      h('div.training-table.native_scroller.box',
        ctrl.vm.mode === 'view' ? renderResult(ctrl) : renderFeedback(ctrl)
      ),
      renderActionsBar(ctrl)
    ])
  ])
}

export function overlay(ctrl: TrainingCtrl): Mithril.ChildArray {
  return [
    renderPromotion(ctrl),
    menu.view(ctrl.menu)
  ]
}

function renderActionsBar(ctrl: TrainingCtrl) {
  return h('section#training_actions.actions_bar', [
    h('button.action_bar_button.training_action.fa.fa-area-chart', {
      oncreate: helper.ontap(ctrl.menu.open)
    }),
    h('button.action_bar_button.training_action.fa.fa-share-alt', {
      oncreate: helper.ontap(ctrl.share, () => Toast.show({ text: 'Share this puzzle', duration: 'short', position: 'bottom' }))
    }),
    h('button.action_bar_button.training_action[data-icon=A]', {
      oncreate: helper.ontap(ctrl.goToAnalysis, () => Toast.show({ text: i18n('analysis'), duration: 'short', position: 'bottom' })),
      disabled: ctrl.vm.mode !== 'view'
    }),
    session.isConnected() ? h('button.action_bar_button.training_action.fa.fa-random', {
      oncreate: helper.ontap(ctrl.resync, () => Toast.show({ text: 'Sync and refresh saved puzzles', duration: 'short', position: 'bottom' }))
    }) : null,
    h('button.action_bar_button.training_action.fa.fa-backward', {
      oncreate: helper.ontap(ctrl.rewind, undefined, ctrl.rewind),
      disabled: !ctrl.canGoBackward()
    }),
    h('button.action_bar_button.training_action.fa.fa-forward', {
      oncreate: helper.ontap(ctrl.fastforward, undefined, ctrl.fastforward),
      disabled: !ctrl.canGoForward()
    })
  ])
}

function renderViewControls(ctrl: TrainingCtrl) {
  return [
    h('button.li-button.training-control.retry', {
      oncreate: helper.ontap(ctrl.retry),
      className: ctrl.vm.loading ? 'disabled' : ''
    }, [h('span.fa.fa-refresh'), h('span', i18n('retry'))]),
    h('button.li-button.training-control.continue', {
      oncreate: helper.ontap(ctrl.newPuzzle),
      className: ctrl.vm.loading ? 'disabled' : ''
    }, [h('span.fa.fa-play'), h('span', i18n('continueTraining'))])
  ]
}

function renderFeedback(ctrl: TrainingCtrl) {

  switch (ctrl.vm.lastFeedback) {
    case 'init':
      return h('div.training-explanation', [
        h('div.player', [
          h('div.piece-no-square', {
            className: settings.general.theme.piece(),
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
            h('span', 'But you can do better')
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
            h('strong', i18n('notTheMove')),
            h('span', i18n('trySomethingElse'))
          ])
        ]),
        renderViewSolution(ctrl)
      ])
  }

}

function renderViewSolution(ctrl: TrainingCtrl) {
  return ctrl.vm.canViewSolution ? h('button.fatButton', {
    oncreate: (vnode: Mithril.VnodeDOM<any, any>) => {
      helper.elFadeIn(vnode.dom as HTMLElement, 1500, '0', '0.8')
      helper.ontap(ctrl.viewSolution)(vnode)
    }
  }, i18n('viewTheSolution')) : h('div.buttonPlaceholder', '')
}

function renderVoteControls(ctrl: TrainingCtrl) {
  return [
    h('div.buttons', [
      h('span.fa.fa-caret-up', {
        oncreate: helper.ontap(ctrl.upvote),
        className: ctrl.vm.voted === true ? 'voted' : ''
      }),
      h('span.fa.fa-caret-down', {
        oncreate: helper.ontap(ctrl.downvote),
        className: ctrl.vm.voted === false ? 'voted' : ''
      })
    ])
  ]
}

function renderResult(ctrl: TrainingCtrl) {
  if (ctrl.vm.lastFeedback === 'win') {
    return [
      h('div.training-half', [
        h('div.training-icon.win', '✓'),
        h('strong', [i18n('puzzleSuccess')]),
        session.isConnected() ?
          h('div.training-vote', renderVoteControls(ctrl)) : null
      ]),
      h('div.training-half', renderViewControls(ctrl))
    ]
  }
  else {
    return [
      h('div.training-half', [
        h('strong', i18n('puzzleComplete')),
        session.isConnected() ?
          h('div.training-vote', renderVoteControls(ctrl)) : null
      ]),
      h('div.training-half', renderViewControls(ctrl))
    ]
  }
}
