import { Plugins } from '@capacitor/core'
import h from 'mithril/hyperscript'
import settings from '../../settings'
import { header } from '../shared/common'
import Board from '../shared/Board'
import * as helper from '../helper'
import i18n from '../../i18n'
import layout from '../layout'
import continuePopup from '../shared/continuePopup'
import pasteFenPopup from './pasteFenPopup'
import EditorCtrl from './EditorCtrl'
import menu, { renderSelectColorPosition, renderCastlingOptions } from './menu'

export default function view(ctrl: EditorCtrl) {
  const color = ctrl.chessground.state.orientation
  const opposite = color === 'white' ? 'black' : 'white'
  const isPortrait = helper.isPortrait()

  const board = h(Board, {
    variant: ctrl.data.game.variant.key,
    chessground: ctrl.chessground,
  })

  return layout.board(
    header(i18n('boardEditor')),
    [
      board,
      h('div.editor-wrapper', [
        h('div#boardEditor.editor-table.box', {
          className: settings.general.theme.piece(),
          oncreate: ctrl.editorOnCreate,
          onremove: ctrl.editorOnRemove
        }, [
          h('div.editor-piecesDrawer', [
            sparePieces(opposite, color, 'top'),
            sparePieces(color, color, 'bottom')
          ]),
          !isPortrait && helper.isTablet() ? h('div.editor-menu', [
            renderSelectColorPosition(ctrl),
            renderCastlingOptions(ctrl)
          ]) : null
        ]),
        renderActionsBar(ctrl)
      ])
    ],
    undefined,
    [
      menu.view(ctrl.menu),
      continuePopup.view(ctrl.continuePopup),
      pasteFenPopup.view(ctrl.pasteFenPopup)
    ]
  )
}

function sparePieces(color: Color, orientation: Color, position: 'top' | 'bottom') {
  return h('div', {
    className: ['sparePieces', position, 'orientation-' + orientation, color].join(' ')
  }, h('div.sparePiecesInner', ['king', 'queen', 'rook', 'bishop', 'knight', 'pawn'].map((role) => {
    return h('div.sparePiece', h('piece', {
      className: color + ' ' + role,
      'data-color': color,
      'data-role': role
    }))
  })))
}

function renderActionsBar(ctrl: EditorCtrl) {
  return h('section.actions_bar', [
    helper.isPortrait() || !helper.isTablet() ? h('button.action_bar_button.fa.fa-gear', {
      oncreate: helper.ontap(ctrl.menu.open)
    }) : null,
    h('button.action_bar_button[data-icon=B]', {
      oncreate: helper.ontap(ctrl.chessground.toggleOrientation)
    }),
    h('button.action_bar_button[data-icon=U]', {
      disabled: !ctrl.data.playable,
      oncreate: helper.ontap(ctrl.continueFromHere, () => Plugins.LiToast.show({ text: i18n('continueFromHere'), duration: 'short', position: 'bottom' }))
    }),
    h('button.action_bar_button[data-icon=A]', {
      disabled: !ctrl.data.playable,
      oncreate: helper.ontap(ctrl.goToAnalyse, () => Plugins.LiToast.show({ text: i18n('analysis'), duration: 'short', position: 'bottom' }))
    }),
    h('button.action_bar_button.fa.fa-upload', {
      oncreate: helper.ontap(ctrl.pasteFenPopup.open,
        () => Plugins.LiToast.show({ text: i18n('Load position from FEN'), duration: 'short', position: 'bottom' }))
    }),
    h('button.action_bar_button.fa.fa-share-alt', {
      oncreate: helper.ontap(
        () => Plugins.LiShare.share({ text: ctrl.computeFen() }),
        () => Plugins.LiToast.show({ text: 'Share FEN', duration: 'short', position: 'bottom' })
      )
    })
  ])
}
