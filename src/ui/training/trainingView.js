import layout from '../layout'
import router from '../../router'
import { emptyFen } from '../../utils/fen'
import i18n from '../../i18n'
import { header as renderHeader, connectingHeader } from '../shared/common'
import ViewOnlyBoard from '../shared/ViewOnlyBoard'
import Board from '../shared/Board'
import { view as renderPromotion } from '../shared/offlineRound/promotion'
import * as helper from '../helper'
import menu from './menu'
import * as h from 'mithril/hyperscript'

export default function view(vnode) {
  const ctrl = vnode.state

  let header

  if (!ctrl.data || ctrl.vm.loading) {
    header = connectingHeader
  }
  else {
    const viewGame = ctrl.data.puzzle.gameId ? helper.ontap(
      () => router.set(`/game/${ctrl.data.puzzle.gameId}/${ctrl.data.puzzle.color}`),
      () => window.plugins.toast.show(i18n('fromGameLink', ctrl.data.puzzle.gameId), 'short', 'bottom')
    ) : () => {}
    header = () => renderHeader(h('div.main_header_title.withSub', [
      h('h1', i18n('training')),
      h('h2.header-subTitle', {
        oncreate: viewGame
      }, [
        '#', ctrl.data.puzzle.id,
        ' • ', 'Rating: ', ctrl.data.mode === 'view' ? ctrl.data.puzzle.rating : '?',
        ' • ', i18n('playedXTimes', ctrl.data.puzzle.attempts)
      ])
    ]))
  }

  return layout.board(
    header,
    renderContent.bind(undefined, ctrl),
    () => [
      renderPromotion(ctrl),
      menu.view(ctrl.menu)
    ]
  )

}

function renderContent(ctrl) {
  const isPortrait = helper.isPortrait()
  const bounds = helper.getBoardBounds(helper.viewportDim(), isPortrait, 'training')
  const key = isPortrait ? 'o-portrait' : 'o-landscape'

  if (!ctrl.data) return h.fragment({ key }, [
    h('section.board_wrapper', [
      h(ViewOnlyBoard, { fen: emptyFen, orientation: 'white', bounds })
    ])
  ])

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
    ctrl.data.mode === 'view' ?
      null :
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
    h('button.training-control.retry', {
      oncreate: helper.ontap(ctrl.retry)
    }, [h('span.fa.fa-refresh'), i18n('retryThisPuzzle')]),
    h('button.training-control.continue', {
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
        ])
      ]
    case 'great':
      return [
        h('div.training-icon.win', '✓'),
        h('div.training-instruction', [
          h('strong', i18n('bestMove')),
          h('span', i18n('keepGoing'))
        ])
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

