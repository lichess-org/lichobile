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
      i18n('rating'), ' ' + (ctrl.data.mode === 'view' ? ctrl.data.puzzle.rating : '?'),
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
        ctrl.data.mode === 'view' ? renderResult(ctrl) : renderFeedback(ctrl)
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
      disabled: ctrl.data.mode !== 'view'
    }),
    // h('button.action_bar_button.training_action.fa.fa-backward', {
    //   oncreate: helper.ontap(ctrl.jumpPrev, undefined, ctrl.jumpPrev),
    //   key: 'historyPrev',
    //   disabled: !history || !(step !== step - 1 && step - 1 >= 0 && step - 1 < history.length)
    // }),
    // h('button.action_bar_button.training_action.fa.fa-forward', {
    //   oncreate: helper.ontap(ctrl.jumpNext, undefined, ctrl.jumpNext),
    //   key: 'historyNext',
    //   disabled: !history || !(step !== step + 1 && step + 1 >= 0 && step + 1 < history.length)
    // })
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
            h('strong', i18n(ctrl.chessground.state.turnColor === ctrl.data.puzzle.color ? 'yourTurn' : 'waiting')),
            h('p', i18n(ctrl.data.puzzle.color === 'white' ? 'findTheBestMoveForWhite' : 'findTheBestMoveForBlack')),
          ])
        ]),
        h('button.fatButton', { oncreate: helper.ontap(ctrl.viewSolution) }, i18n('viewTheSolution'))
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
        h('button.fatButton', { oncreate: helper.ontap(ctrl.viewSolution) }, i18n('viewTheSolution'))
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
        h('button.fatButton', { oncreate: helper.ontap(ctrl.viewSolution) }, i18n('viewTheSolution'))
      ])
    case 'fail':
      return h('div.training-explanation', [
        h('div.training-half', [
          h('div.training-icon.loss', '✗'),
          h('div.training-instruction', [
            h('strong', i18n('puzzleFailed')),
            ctrl.data.mode === 'try' ? h('span', i18n('butYouCanKeepTrying')) : null
          ])
        ]),
        h('div.training-half')
      ])
  }

}

// function renderRatingDiff(diff: number) {
//   return h('strong.puzzleRatingDiff', diff > 0 ? '+' + diff : diff)
// }

function renderWin(ctrl: TrainingCtrl) {
  return [
    h('div.training-half', [
      h('div.training-icon.win', '✓'),
      h('strong', [i18n('victory')])
    ]),
    h('div.training-half', renderViewControls(ctrl))
  ]
}

function renderLoss(ctrl: TrainingCtrl) {
  return [
    h('div.training-half', [
      h('div.training-icon.loss', '✗'),
      h('strong', [i18n('puzzleFailed')])
    ]),
    h('div.training-half', renderViewControls(ctrl))
  ]
}

function renderResult(ctrl: TrainingCtrl) {
  if (ctrl.vm.lastFeedback === 'win') return renderWin(ctrl)
  else return renderLoss(ctrl)
}
