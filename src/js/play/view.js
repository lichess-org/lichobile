var round = require('../round');
var mainView = require('../mainView');
var m = require('mithril');
var Chessground = require('chessground');

module.exports = function(ctrl) {
  function renderBoard() {
    if (ctrl.playing())
      return round.view(ctrl.round);
    else
      return m('div.chessground.wood.merida.withMoved.withDest', [
        Chessground.view(ctrl.chessground)
      ]);
  }

  return mainView(ctrl, function() {
    return m('div', [
      renderBoard(),
      m('button', { config: function(el, isUpdate) {
        if (!isUpdate) el.addEventListener('touchstart', ctrl.startAIGame);
      }}, 'Start AI!'),
      m('button', { config: function(el, isUpdate) {
        if (!isUpdate) el.addEventListener('touchstart', ctrl.seekHumanGame);
      }}, 'Start Human!')
    ]);
  });
};
