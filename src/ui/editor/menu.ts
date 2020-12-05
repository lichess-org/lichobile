import i18n from '../../i18n'
import popupWidget from '../shared/popup'
import router from '../../router'
import * as helper from '../helper'
import h from 'mithril/hyperscript'
import EditorCtrl, { MenuInterface } from './EditorCtrl'

export default {

  controller: function(root: EditorCtrl) {
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

  view: function(ctrl: MenuInterface) {
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
  const fen = ctrl.computeFen()
  return h('div.editorSelectors', [
    h('div.select_input', [
      h('label', {
        'for': 'select_editor_positions'
      }, 'Openings'),
      h('select.positions', {
        id: 'select_editor_positions',
        onchange(e: Event) {
          ctrl.loadNewFen((e.target as HTMLInputElement).value)
        }
      }, [
        optgroup('Set the board', [
          position2option(fen, {
            name: '-- Position --',
            fen: '',
            eco: '',
          }),
          ctrl.extraPositions.map((pos: BoardPosition) => position2option(fen, pos))
        ]),
        optgroup(i18n('popularOpenings'),
          ctrl.positions().map((pos: BoardPosition) => position2option(fen, pos, true))
        )
      ])
    ]),
    h('div.select_input', [
      h('label', {
        'for': 'select_editor_endgames'
      }, 'Endgames'),
      h('select.positions', {
        id: 'select_editor_endgames',
        onchange(e: Event) {
          ctrl.loadNewFen((e.target as HTMLInputElement).value)
        }
      }, [
        optgroup('Set the board', [
          position2option(fen, {
            name: '-- Position --',
            fen: '',
            eco: '',
          }),
          ctrl.extraPositions.slice(1).map((pos: BoardPosition) => position2option(fen, pos))
        ]),
        optgroup('Endgames positions',
          ctrl.endgamesPositions().map((pos: BoardPosition) => position2option(fen, pos))
        )
      ])
    ]),
    h('div.select_input', [
      h('label', {
        'for': 'select_editor_color'
      }, 'Color'),
      h('select', {
        id: 'select_editor_color',
        value: ctrl.data.editor.color(),
        onchange(e: Event) {
          ctrl.setColor((e.target as HTMLInputElement).value as Color)
        },
      }, [
        h('option[value=w]', i18n('whitePlays')),
        h('option[value=b]', i18n('blackPlays'))
      ])
    ])
  ])
}

export function renderCastlingOptions(ctrl: EditorCtrl) {
  const white = [
    ['K', i18n('whiteCastlingKingside')],
    ['Q', 'O-O-O'],
  ]
  const black = [
    ['k', i18n('blackCastlingKingside')],
    ['q', 'O-O-O']
  ]

  return h('div.editor-castling', [
    h('h3', i18n('castling')),
    h('div.form-multipleChoice', white.map(c => castlingButton(ctrl, c))),
    h('div.form-multipleChoice', black.map(c => castlingButton(ctrl, c))),
  ])
}

function castlingButton(ctrl: EditorCtrl, c: string[]) {
  const cur = ctrl.data.editor.castles[c[0]]
  return h('div', {
    className: cur() ? 'selected' : '',
    oncreate: helper.ontap(() => cur(!cur()))
  }, c[1])
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
