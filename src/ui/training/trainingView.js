import * as h from 'mithril/hyperscript'
import router from '../../router'
import i18n from '../../i18n'
import Board from '../shared/Board'
import { view as renderPromotion } from '../shared/offlineRound/promotion'
import { header as renderHeader } from '../shared/common'
import * as helper from '../helper'
import menu from './menu'

export function renderHeader(ctrl) {
  return renderHeader(h('div.main_header_title.withSub', [
    h('h1', i18n('puzzleId', ctrl.data.puzzle.id)),
    h('h2.header-subTitle', [
      i18n('rating'), ' ' + (ctrl.data.mode === 'view' ? ctrl.data.puzzle.rating : '?'),
      ' • ', i18n('playedXTimes', ctrl.data.puzzle.attempts)
    ])
  ]))
}

export function renderContent(ctrl, key, bounds) {
  const board = h(Board, {
    data: ctrl.data,
    bounds,
    chessground: ctrl.chessground
  })

  return h.fragment({ key }, [
    board,
    h('div.training-tableWrapper', [
      h('div.training-table.native_scroller',
        ctrl.data.mode === 'view' ? renderResult(ctrl) : renderExplanation(ctrl),
      ),
      renderActionsBar(ctrl)
    ])
  ])
}

export function overlay(ctrl) {
  return [
    renderPromotion(ctrl),
    menu.view(ctrl.menu)
  ]
}

function renderExplanation(ctrl) {
  const hasComment = ctrl.data.comment !== undefined
  return h('div.training-explanation', hasComment ? renderCommentary(ctrl) : [
    h('div.player', [
      h('div.piece-no-square', {
        className: ctrl.pieceTheme
      }, h('piece.king.' + ctrl.data.puzzle.color)),
      h('div.training-instruction', [
        h('strong',i18n(ctrl.chessground.state.turnColor === ctrl.data.puzzle.color ? 'yourTurn' : 'waiting')),
        h('p',i18n(ctrl.data.puzzle.color === 'white' ? 'findTheBestMoveForWhite' : 'findTheBestMoveForBlack')),
      ]),
    ]),
    h('button.fatButton', { oncreate: helper.ontap(ctrl.giveUp) }, i18n('resign'))
  ])
}

function renderActionsBar(ctrl) {
  const history = ctrl.data.replay && ctrl.data.replay.history
  const step = ctrl.data.replay && ctrl.data.replay.step
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
    h('button.action_bar_button.training_action.fa.fa-backward', {
      oncreate: helper.ontap(ctrl.jumpPrev, null, ctrl.jumpPrev),
      key: 'historyPrev',
      disabled: !history || !(step !== step - 1 && step - 1 >= 0 && step - 1 < history.length)
    }),
    h('button.action_bar_button.training_action.fa.fa-forward', {
      oncreate: helper.ontap(ctrl.jumpNext, null, ctrl.jumpNext),
      key: 'historyNext',
      disabled: !history || !(step !== step + 1 && step + 1 >= 0 && step + 1 < history.length)
    })
  ])
}

function renderViewControls(ctrl) {
  return [
    h('div.li-button.training-control.retry', {
      oncreate: helper.ontap(ctrl.retry)
    }, [h('span.fa.fa-refresh'), i18n('retryThisPuzzle')]),
    h('div.li-button.training-control.continue', {
      oncreate: helper.ontap(ctrl.newPuzzle.bind(ctrl, true))
    }, [h('span.fa.fa-play'), i18n('continueTraining')])
  ]
}

function renderCommentary(ctrl) {
  switch (ctrl.data.comment) {
    case 'retry':
      return [
        h('div.training-icon', '!'),
        h('div.training-instruction', [
          h('strong', i18n('goodMove')),
          h('span', i18n('butYouCanDoBetter'))
        ]),
        h('button.fatButton', { oncreate: helper.ontap(ctrl.giveUp) }, i18n('resign'))
      ]
    case 'great':
      return [
        h('div.training-icon.win', '✓'),
        h('div.training-instruction', [
          h('strong', i18n('bestMove')),
          h('span', i18n('keepGoing'))
        ]),
        h('button.fatButton', { oncreate: helper.ontap(ctrl.giveUp) }, i18n('resign'))
      ]
    case 'fail':
      return [
        h('div.training-half', [
          h('div.training-icon.loss', '✗'),
          h('div.training-instruction', [
            h('strong', i18n('puzzleFailed')),
            ctrl.data.mode === 'try' ? h('span', i18n('butYouCanKeepTrying')) : null
          ])
        ]),
        h('div.training-half')
      ]
  }
}

function renderRatingDiff(diff) {
  return h('strong.puzzleRatingDiff', diff > 0 ? '+' + diff : diff)
}

function renderWin(ctrl, attempt) {
  return [
    h('div.training-half', [
      h('div.training-icon.win', '✓'),
      h('strong', [i18n('victory'), attempt ? renderRatingDiff(attempt.userRatingDiff) : null])
    ]),
    h('div.training-half', renderViewControls(ctrl))
  ]
}

function renderLoss(ctrl, attempt) {
  return [
    h('div.training-half', [
      h('div.training-icon.loss', '✗'),
      h('strong', [i18n('puzzleFailed'), attempt ? renderRatingDiff(attempt.userRatingDiff) : null])
    ]),
    h('div.training-half', renderViewControls(ctrl))
  ]
}

function renderResult(ctrl) {
  switch (ctrl.data.win) {
    case true:
      return renderWin(ctrl, null)
    case false:
      return renderLoss(ctrl, null)
    default:
      switch (ctrl.data.attempt && ctrl.data.attempt.win) {
        case true:
          return renderWin(ctrl, ctrl.data.attempt)
        case false:
          return renderLoss(ctrl, ctrl.data.attempt)
      }
  }
  return null
}

