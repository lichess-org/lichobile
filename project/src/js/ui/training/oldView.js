var map = require('lodash/collection/map');
var chessground = require('chessground');
var partial = chessground.util.partial;
var m = require('mithril');
var puzzle = require('./puzzle');
import i18n from '../../i18n';

// useful in translation arguments
function strong(txt) {
  return '<strong>' + txt + '</strong>';
}

function renderSide(ctrl) {
  return m('div.side', [
    renderCommentary(ctrl),
    renderResult(ctrl)
  ]);
}

function wheel(ctrl, e) {
  if (ctrl.data.mode != 'view') return true;
  if (e.deltaY > 0) ctrl.jump(ctrl.data.replay.step + 1);
  else if (e.deltaY < 0) ctrl.jump(ctrl.data.replay.step - 1);
  m.redraw();
  e.preventDefault();
  return false;
}

var loading = m('div.loader.fast');

module.exports = function(ctrl) {
  return m('div#puzzle.training', [
    renderSide(ctrl),
    m('div.board_and_ground', [
      m('div', {
          config: function(el, isUpdate) {
            if (!isUpdate) el.addEventListener('wheel', function(e) {
              return wheel(ctrl, e);
            });
          }
        },
        chessground.view(ctrl.chessground)),
      m('div.right', ctrl.data.mode === 'view' ? renderViewTable(ctrl) : renderPlayTable(ctrl))
    ]),
    m('div.underboard',
      m('div.center', [
        renderFooter(ctrl),
        ctrl.data.user ? renderHistory(ctrl) : null
      ])
    )
  ]);
};
