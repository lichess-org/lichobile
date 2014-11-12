var roundView = require('../round/view/main');
var layout = require('../layout');
var menu = require('../menu');
var m = require('mithril');
var Chessground = require('chessground');

module.exports = function(ctrl) {
  function header() {
    if (ctrl.playing())
      return roundView.renderOpponent(ctrl.round);
    else
      return m('section.opponent', [m('div.infos')]);
  }

  function board() {
    if (ctrl.playing())
      return roundView.renderBoard(ctrl.round);
    else
      return m('section#board.grey.merida', [
        Chessground.view(ctrl.chessground)
      ]);
  }

  function footer() {
    var buttons = [
      m('button', { config: function(el, isUpdate) {
        if (!isUpdate) el.addEventListener('touchstart', ctrl.startAIGame);
      }}, 'Start AI!'),
      m('button', { config: function(el, isUpdate) {
        if (!isUpdate) el.addEventListener('touchstart', ctrl.seekHumanGame);
      }}, 'Start Human!')
    ];
    if (ctrl.playing())
      return [roundView.renderPlayer(ctrl.round), buttons];
    else
      return [m('section.player', [m('div.infos')]), buttons];
  }

  return layout(ctrl, header, board, footer, menu.view);
};
