import i18n from '../../i18n';
import popupWidget from '../shared/popup';
import backbutton from '../../backbutton';
import helper from '../helper';
import m from 'mithril';

export default {

  controller: function(root) {
    let isOpen = false;

    function open() {
      backbutton.stack.push(close);
      isOpen = true;
    }

    function close(fromBB) {
      if (fromBB !== 'backbutton' && isOpen) backbutton.stack.pop();
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
      m('h2.withIcon.fa.fa-pencil', i18n('boardEditor')),
      renderEditorMenu.bind(undefined, ctrl.root),
      ctrl.isOpen(),
      ctrl.close
    );
  }
};

function renderEditorMenu(ctrl) {
  let children;
  if (helper.isPortrait())
    children = [
      renderSelectColorPosition(ctrl),
      renderCastlingOptions(ctrl)
    ];
  else
    children = [
      helper.isWideScreen() ? null : renderCastlingOptions(ctrl)
    ];

  return m('div.editorMenu', children);
}

export function renderSelectColorPosition(ctrl) {
  const fen = ctrl.computeFen();
  return m('div.editorSelectors', [
    m('div.select_input', [
      m('label', {
        'for': 'select_editor_positions'
      }, 'Position'),
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
    m('div.select_input.color', [
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

export function renderCastlingOptions(ctrl) {
  return m('div.castling', [
    m('strong', i18n('castling')),
    m('div', [
      castleCheckBox(ctrl, 'K', i18n('whiteCastlingKingside')),
      castleCheckBox(ctrl, 'Q', i18n('whiteCastlingQueenside'))
    ]),
    m('div', [
      castleCheckBox(ctrl, 'k', i18n('blackCastlingKingside')),
      castleCheckBox(ctrl, 'q', i18n('blackCastlingQueenside'))
    ])
  ]);
}

function castleCheckBox(ctrl, id, label) {
  return m('div.check_container', [
    m('label', {
      'for': id
    }, label),
    m('input[type=checkbox]', {
      name: id,
      checked: ctrl.data.editor.castles[id](),
      onchange: function() {
        ctrl.data.editor.castles[id](this.checked);
      }
    })
  ]);
}

function position2option(fen, pos) {
  return {
    tag: 'option',
    attrs: {
      value: pos.fen,
      selected: fen === pos.fen
    },
    children: pos.name
  };
}

function optgroup(name, opts) {
  return m('optgroup', {
    label: name
  }, opts);
}
