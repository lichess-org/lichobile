import i18n from '../../i18n';
import popupWidget from '../shared/popup';
import backbutton from '../../backbutton';
import helper from '../helper';
import m from 'mithril';
import formWidgets from '../shared/form';

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
  const fen = ctrl.computeFen();
  return controls(ctrl, fen);
}

function castleCheckBox(ctrl, id, label, reversed) {
  var input = m('input[type=checkbox]', {
    checked: ctrl.castles[id](),
    onchange: function() {
      ctrl.castles[id](this.checked);
    }
  });
  return m('label', reversed ? [input, label] : [label, input]);
}

function optgroup(name, opts) {
  return m('optgroup', {
    label: name
  }, opts);
}

function controls(ctrl, fen) {
  var positionIndex = ctrl.positionIndex[fen.split(' ')[0]];
  var currentPosition = positionIndex !== -1 ? ctrl.positions()[positionIndex] : null;
  var encodedFen = fen.replace(/\s/g, '_');
  var position2option = function(pos) {
    return {
      tag: 'option',
      attrs: {
        value: pos.fen,
        selected: currentPosition && currentPosition.fen === pos.fen
      },
      children: [pos.name]
    };
  };
  return m('div.action', [
    m('div.select_input', [
      m('label', {
        'for': 'select_positions'
      }, ''),
      m('select.positions', {
        id: 'select_positions',
        onchange: function(e) {
          ctrl.loadNewFen(e.target.value);
        }
      }, [
        optgroup('Set the board', [
          currentPosition ? null : m('option', {
            value: fen,
            selected: true
          }, '- Position -'),
          ctrl.extraPositions.map(position2option)
        ]),
        optgroup('Popular openings',
          ctrl.positions().map(position2option)
        )
      ])
    ]),
    m('div.metadata.content_box', [
      m('div.color', [
        m('select', {
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
          castleCheckBox(ctrl, 'K', i18n('whiteCastlingKingside'), false),
          castleCheckBox(ctrl, 'Q', i18n('whiteCastlingQueenside'), true)
        ]),
        m('div', [
          castleCheckBox(ctrl, 'k', i18n('blackCastlingKingside'), false),
          castleCheckBox(ctrl, 'q', i18n('blackCastlingQueenside'), true)
        ])
      ])
    ])
  ]);
}

function inputs(ctrl, fen) {
  return m('div.copyables', [
    m('p', [
      m('strong.name', 'FEN'),
      m('input.copyable[readonly][spellCheck=false]', {
        value: fen
      })
    ])
  ]);
}

