import i18n from '../../i18n';
import popupWidget from '../shared/popup';
import backbutton from '../../backbutton';
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
      m('h2[data-icon=*]', i18n('boardEditor')),
      renderEditorMenu.bind(undefined, ctrl.root),
      ctrl.isOpen(),
      ctrl.close
    );
  }
};

function renderEditorMenu(ctrl) {
  var position2option = function (pos) {
    return {
      tag: 'option',
      attrs: {
        value: pos.fen,
        selected: ctrl.fen === pos.fen
      },
      children: [pos.name]
    };
  };
  return [
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
          ctrl.extraPositions.map(position2option)
        ]),
        optgroup('Popular openings',
          ctrl.positions().map(position2option)
        )
      ])
    ]),
    m('div', [
      m('div.select_input.color', [
        m('label', {
          'for': 'select_editor_color'
        }, 'Color'),
        m('select', {
          id: 'select_editor_color',
          value: ctrl.color(),
          onchange: m.withAttr('value', ctrl.color)
        }, [
          m('option[value=w]', i18n('whitePlays')),
          m('option[value=b]', i18n('blackPlays'))
        ])
      ]),
      m('div.castling', [
        m('strong', i18n('castling')),
        m('div', [
          castleCheckBox(ctrl, 'K', i18n('whiteCastlingKingside')),
          castleCheckBox(ctrl, 'Q', i18n('whiteCastlingQueenside'))
        ]),
        m('div', [
          castleCheckBox(ctrl, 'k', i18n('blackCastlingKingside')),
          castleCheckBox(ctrl, 'q', i18n('blackCastlingQueenside'))
        ])
      ])
    ])
  ];
}

function castleCheckBox(ctrl, id, label) {
  return m('div.check_container', [
    m('label', {
      'for': id
    }, label),
    m('input[type=checkbox]', {
      name: id,
      checked: ctrl.castles[id](),
      onchange: function() {
        ctrl.castles[id](this.checked);
      }
    })
  ]);
}

function optgroup(name, opts) {
  return m('optgroup', {
    label: name
  }, opts);
}
