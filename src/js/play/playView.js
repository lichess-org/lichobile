var roundView = require('../round/view/main');
var layout = require('../layout');
var menu = require('../menu');
var overlay = require('./overlay');
var Chessground = require('chessground');
var partial = require('../utils').partial;

module.exports = function(ctrl) {
  function header() {
    var children = [
      m('nav', [
        m('a.fa.fa-navicon', { config: function(el, isUpdate) {
          if (!isUpdate) el.addEventListener('touchstart', ctrl.menu.toggle);
        }}),
        m('h1', ctrl.title()),
        m('a.fa.fa-trophy', {
          config: function(el, isUpdate) {
            if (!isUpdate) el.addEventListener('touchstart', ctrl.overlay.open);
          },
          style: { display: ctrl.overlay.isOpen ? 'none' : 'inline-block' }
        })
      ])
    ];

    if (ctrl.playing())
      children.push(roundView.renderOpponent(ctrl.round));
    else
      children.push(m('section.opponent', [m('div.infos')]));

    return children;
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

  return layout(ctrl, header, board, footer, menu.view, partial(overlay.view, ctrl.overlay));
};
