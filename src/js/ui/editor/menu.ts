import i18n from '../../i18n';
import popupWidget from '../shared/popup';
import router from '../../router';
import * as helper from '../helper';
import * as m from 'mithril';
import Editor from './Editor'

export interface MenuInterface {
  open: () => void
  close: () => void
  isOpen: () => boolean
  root: Editor
}

export default {

  controller: function(root: Editor) {
    let isOpen = false;

    function open() {
      router.backbutton.stack.push(close);
      isOpen = true;
    }

    function close(fromBB?: string) {
      if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop();
      isOpen = false;
    }

    return {
      open: open,
      close: close,
      isOpen() {
        return isOpen
      },
      root
    };
  },

  view: function(ctrl: MenuInterface) {
    return popupWidget(
      'editorMenu',
      null,
      () => renderEditorMenu(ctrl.root),
      ctrl.isOpen(),
      ctrl.close
    );
  }
};

function renderEditorMenu(ctrl: Editor) {
  return m('div.editorMenu', [
    renderSelectColorPosition(ctrl),
    renderCastlingOptions(ctrl)
  ]);
}

export function renderSelectColorPosition(ctrl: Editor) {
  const fen = ctrl.computeFen();
  return m('div.editorSelectors', [
    m('div.select_input', [
      m('label', {
        'for': 'select_editor_positions'
      }, 'Openings'),
      m('select.positions', {
        id: 'select_editor_positions',
        onchange(e: Event) {
          ctrl.loadNewFen((e.target as HTMLInputElement).value);
        }
      }, [
        optgroup('Set the board', [
          position2option(fen, {
            name: '-- Position --',
            fen: ''
          }),
          ctrl.extraPositions.map((pos: BoardPosition) => position2option(fen, pos))
        ]),
        optgroup('Popular openings',
          ctrl.positions().map((pos: BoardPosition) => position2option(fen, pos))
        )
      ])
    ]),
    m('div.select_input', [
      m('label', {
        'for': 'select_editor_endgames'
      }, 'Endgames'),
      m('select.positions', {
        id: 'select_editor_endgames',
        onchange(e: Event) {
          ctrl.loadNewFen((e.target as HTMLInputElement).value);
        }
      }, [
        optgroup('Set the board', [
          position2option(fen, {
            name: '-- Position --',
            fen: ''
          }),
          ctrl.extraPositions.slice(1).map((pos: BoardPosition) => position2option(fen, pos))
        ]),
        optgroup('Endgames positions',
          ctrl.endgamesPositions().map((pos: BoardPosition) => position2option.bind(fen, pos))
        )
      ])
    ]),
    m('div.select_input', [
      m('label', {
        'for': 'select_editor_color'
      }, 'Color'),
      m('select', {
        id: 'select_editor_color',
        value: ctrl.data.editor.color(),
        onchange: m.withAttr('value', ctrl.data.editor.color)
      }, [
        m('option[value=w]', i18n('whitePlays')),
        m('option[value=b]', i18n('blackPlays'))
      ])
    ])
  ]);
}

function renderCastlingOptions(ctrl: Editor) {
  const white = [
    ['K', i18n('whiteCastlingKingside')],
    ['Q', i18n('whiteCastlingQueenside')],
  ];
  const black = [
    ['k', i18n('blackCastlingKingside')],
    ['q', i18n('blackCastlingQueenside')]
  ];

  return m('div.editor-castling', [
    m('h3', i18n('castling')),
    m('div.form-multipleChoice', white.map(c => castlingButton(ctrl, c))),
    m('div.form-multipleChoice', black.map(c => castlingButton(ctrl, c))),
  ]);
}

function castlingButton(ctrl: Editor, c: string[]) {
  const cur = ctrl.data.editor.castles[c[0]];
  return m('span', {
    className: cur() ? 'selected' : '',
    oncreate: helper.ontap(() => cur(!cur()))
  }, c[1]);
}

function position2option(fen: string, pos: BoardPosition): Mithril.ChildNode {
  return m('option', {
    value: pos.fen,
    selected: fen === pos.fen
  }, pos.name)
}

function optgroup(name: string, opts: Mithril.Children) {
  return m('optgroup', {
    label: name
  }, opts);
}
