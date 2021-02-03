import h from 'mithril/hyperscript'
import i18n from '../../i18n'
import popupWidget from '../shared/popup'
import router from '../../router'
import * as helper from '../helper'

import EditorCtrl from './EditorCtrl'
import { BoardPosition, CastlingToggle } from './interfaces'

export interface MenuInterface {
  open: () => void
  close: () => void
  isOpen: () => boolean
  root: EditorCtrl
}

export default {

  controller(root: EditorCtrl): MenuInterface {
    let isOpen = false

    function open() {
      router.backbutton.stack.push(close)
      isOpen = true
    }

    function close(fromBB?: string) {
      if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop()
      isOpen = false
    }

    return {
      open: open,
      close: close,
      isOpen() {
        return isOpen
      },
      root
    }
  },

  view(ctrl: MenuInterface): Mithril.Children {
    return popupWidget(
      'editorMenu',
      undefined,
      () => renderEditorMenu(ctrl.root),
      ctrl.isOpen(),
      ctrl.close
    )
  }
}

function renderEditorMenu(ctrl: EditorCtrl) {
  return h('div.editorMenu', [
    renderSelectColorPosition(ctrl),
    renderCastlingOptions(ctrl)
  ])
}

export function renderSelectColorPosition(ctrl: EditorCtrl) {
  const fen = ctrl.getFen()
  return h('div.editorSelectors', [
    h('div.select_input', [
      h('select.positions', {
        id: 'select_editor_positions',
        onchange(e: Event) {
          ctrl.loadNewFen((e.target as HTMLInputElement).value)
        }
      }, [
        optgroup(i18n('setTheBoard'), [
          position2option(fen, {
            name: `-- ${i18n('popularOpenings')} --`,
            fen: '',
            eco: '',
          }),
          ctrl.extraPositions.map((pos: BoardPosition) => position2option(fen, pos))
        ]),
        optgroup(i18n('popularOpenings'),
          ctrl.positions.map((pos: BoardPosition) => position2option(fen, pos, true))
        )
      ])
    ]),
    h('div.select_input', [
      h('select.positions', {
        id: 'select_editor_endgames',
        onchange(e: Event) {
          ctrl.loadNewFen((e.target as HTMLInputElement).value)
        }
      }, [
        position2option(fen, {
          name: `-- ${i18n('endgame')} --`,
          fen: '',
          eco: '',
        }),
        optgroup(i18n('endgame'),
          ctrl.endgamesPositions.map((pos: BoardPosition) => position2option(fen, pos))
        )
      ])
    ]),
    h('div.select_input', [
      h('select', {
        id: 'select_editor_color',
        value: ctrl.turn,
        onchange(e: Event) {
          ctrl.setTurn((e.target as HTMLInputElement).value as Color)
        },
      }, [
        h('option[value=white]', i18n('whitePlays')),
        h('option[value=black]', i18n('blackPlays'))
      ])
    ])
  ])
}

export function renderCastlingOptions(ctrl: EditorCtrl) {
  return h('div.editor-castling', [
    h('h3', i18n('castling')),
    h('div.form-multipleChoice', [
      castlingButton(ctrl, 'K', i18n('whiteCastlingKingside')),
      castlingButton(ctrl, 'Q', i18n('O-O-O')),
    ]),
    h('div.form-multipleChoice', [
      castlingButton(ctrl, 'k', i18n('blackCastlingKingside')),
      castlingButton(ctrl, 'q', i18n('O-O-O')),
    ]),
  ])
}

function castlingButton(ctrl: EditorCtrl, id: CastlingToggle, label: string) {
  return h('div', {
    className: ctrl.castlingToggles[id] ? 'selected' : '',
    oncreate: helper.ontap(() => ctrl.setCastlingToggle(id, !ctrl.castlingToggles[id]))
  }, label)
}

function position2option(fen: string, pos: BoardPosition, showEco = false): Mithril.Child {
  return h('option', {
    value: pos.fen,
    selected: fen === pos.fen
  }, (showEco ? pos.eco + ' ' : '') + pos.name)
}

function optgroup(name: string, opts: Mithril.Children) {
  return h('optgroup', {
    label: name
  }, opts)
}
