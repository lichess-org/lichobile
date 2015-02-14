var pgnOverlay = require('./pgn');
var utils = require('../../utils');
var i18n = require('../../i18n');
var opposite = require('chessground').util.opposite;
var settings = require('../../settings');
var formWidgets = require('../_formWidgets');

function backToGame(ctrl) {
  return m('button[data-icon=L]', {
    config: utils.ontouchend(ctrl.close)
  }, i18n('backToGame'));
}

function renderEnded(ctrl) {
  var result, status, sit = ctrl.root.replay.situation();
  if (sit.checkmate) {
    result = sit.turnColor === 'white' ? '0-1' : '1-0';
    status = i18n('checkmate') + '. ' + i18n(sit.color === 'white' ? 'blackIsVictorious' : 'whiteIsVictorious') + '.';
    return m('div.result', [result, m('br'), m('br'), status]);
  }
}

function renderAlways(ctrl) {
  var d = ctrl.root.data;
  return [
    m('div.actions', [
      m('button[data-icon=U]', {
        config: utils.ontouchend(utils.ƒ(ctrl.root.initAs, opposite(d.player.color)))
      }, i18n('createAGame')),
      m('button[data-icon=A]', {
        config: utils.ontouchend(ctrl.pgn.open)
      }, i18n('showPGN')),
      formWidgets.renderCheckbox(i18n('Flip pieces after move'), 'flipPieces',
        settings.onChange(settings.otb.flipPieces)),
      m('br'), m('br'), backToGame(ctrl)
    ])
  ];
}

module.exports = {
  controller: function(root) {
    var isOpen = false;
    var pgn = new pgnOverlay.controller(root.replay.pgn);
    return {
      open: function() {
        isOpen = true;
      },
      close: function() {
        pgn.close();
        isOpen = false;
      },
      isOpen: function() {
        return isOpen;
      },
      pgn: pgn,
      root: root
    };
  },
  view: function(ctrl) {
    if (ctrl.pgn.isOpen()) return pgnOverlay.view(ctrl.pgn);
    if (ctrl.isOpen()) return m('div.overlay', [
      m('button.overlay_close.fa.fa-close', {
        config: utils.ontouchend(ctrl.close)
      }),
      m('div#player_controls.overlay_content', [
        renderEnded(ctrl),
        renderAlways(ctrl)
      ])
    ]);
  }
};
