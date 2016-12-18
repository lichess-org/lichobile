import i18n from '../../i18n';
import popupWidget from '../shared/popup';
import router from '../../router';
import * as helper from '../helper';
import * as m from 'mithril';

export default {

  controller: function(root) {
    let isOpen = false;

    function open() {
      router.backbutton.stack.push(close);
      isOpen = true;
    }

    function close(fromBB) {
      if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop();
      isOpen = false;
    }

    return {
      open: open,
      close: close,
      isOpen: function() {
        return isOpen;
      },
      root
    };
  },

  view: function(ctrl) {
    return popupWidget(
      'editorMenu',
      null,
      renderEditorMenu.bind(undefined, ctrl.root),
      ctrl.isOpen(),
      ctrl.close
    );
  }
};

function renderEditorMenu(ctrl) {
  return m('div.editorMenu', [
    renderSelectColorPosition(ctrl),
    renderCastlingOptions(ctrl)
  ]);
}

export function renderSelectColorPosition(ctrl) {
  const fen = ctrl.computeFen();
  return m('div.editorSelectors', [
    m('div.select_input', [
      m('label', {
        'for': 'select_editor_positions'
      }, 'Openings'),
      m('select.positions', {
        id: 'select_editor_positions',
        onchange: function(e) {
          ctrl.loadNewFen(e.target.value);
        }
      }, [
        optgroup('Set the board', [
          position2option(fen, {
            name: '-- Position --',
            fen: ''
          }),
          ctrl.extraPositions.map(position2option.bind(undefined, fen))
        ]),
        optgroup('Popular openings',
          ctrl.positions().map(position2option.bind(undefined, fen))
        )
      ])
    ]),
    m('div.select_input', [
      m('label', {
        'for': 'select_editor_endgames'
      }, 'Endgames'),
      m('select.positions', {
        id: 'select_editor_endgames',
        onchange: function(e) {
          ctrl.loadNewFen(e.target.value);
        }
      }, [
        optgroup('Set the board', [
          position2option(fen, {
            name: '-- Position --',
            fen: ''
          }),
          ctrl.extraPositions.slice(1).map(position2option.bind(undefined, fen))
        ]),
        optgroup('Endgames positions',
          ctrl.endgamesPositions().map(position2option.bind(undefined, fen))
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

function renderCastlingOptions(ctrl) {
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

function castlingButton(ctrl, c) {
  const cur = ctrl.data.editor.castles[c[0]];
  return m('span', {
    className: cur() ? 'selected' : '',
    oncreate: helper.ontap(() => cur(!cur()))
  }, c[1]);
}

function position2option(fen, pos) {
  return <option value={pos.fen} selected={fen === pos.fen}>{pos.name}</option>;
}

function optgroup(name, opts) {
  return m('optgroup', {
    label: name
  }, opts);
}
