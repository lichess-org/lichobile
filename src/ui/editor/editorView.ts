import { Plugins } from '@capacitor/core'
import h from 'mithril/hyperscript'
import router from '../../router'
import settings from '../../settings'
import { header } from '../shared/common'
import Board from '../shared/Board'
import * as helper from '../helper'
import i18n from '../../i18n'
import layout from '../layout'
import continuePopup from '../shared/continuePopup'
import pasteFenPopup from './pasteFenPopup'
import EditorCtrl from './EditorCtrl'
import menu from './menu'

export default function view(ctrl: EditorCtrl) {
  const color = ctrl.chessground.state.orientation
  const opposite = color === 'white' ? 'black' : 'white'
  const isPortrait = helper.isPortrait()
  const bounds = helper.getBoardBounds(helper.viewportDim(), isPortrait)

  const board = h(Board, {
    variant: ctrl.data.game.variant.key,
    chessground: ctrl.chessground,
    bounds
  })

  return layout.board(
    header(i18n('boardEditor')),
    [
      board,
      h('div.editor-wrapper', [
        h('div#boardEditor.editor-table', {
          className: settings.general.theme.piece(),
          oncreate: ctrl.editorOnCreate,
          onremove: ctrl.editorOnRemove
        }, [
          h('div.editor-piecesDrawer', [
            sparePieces(opposite, color, 'top'),
            sparePieces(color, color, 'bottom')
          ]),
        ]),
        renderActionsBar(ctrl)
      ])
    ],
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
    h('button.action_bar_button.fa.fa-gear', {
      oncreate: helper.ontap(ctrl.menu.open)
    }),
    h('button.action_bar_button[data-icon=B]', {
      oncreate: helper.ontap(ctrl.chessground.toggleOrientation)
    }),
    h('button.action_bar_button[data-icon=U]', {
      oncreate: helper.ontap(() => {
        ctrl.continuePopup.open(ctrl.computeFen(), 'standard')
      }, () => Plugins.Toast.show({ text: i18n('continueFromHere'), duration: 'short' }))
    }),
    h('button.action_bar_button[data-icon=A]', {
      oncreate: helper.ontap(() => {
        const fen = encodeURIComponent(ctrl.computeFen())
        router.set(`/analyse/fen/${fen}`)
      }, () => Plugins.Toast.show({ text: i18n('analysis'), duration: 'short' }))
    }),
    h('button.action_bar_button.fa.fa-upload', {
      oncreate: helper.ontap(ctrl.pasteFenPopup.open,
        () => Plugins.Toast.show({ text: i18n('Load position from FEN'), duration: 'short' }))
    }),
    h('button.action_bar_button.fa.fa-share-alt', {
      oncreate: helper.ontap(
        () => Plugins.Share.share({ text: ctrl.computeFen() }),
        () => Plugins.Toast.show({ text: 'Share FEN', duration: 'short' })
      )
    })
  ])
}
