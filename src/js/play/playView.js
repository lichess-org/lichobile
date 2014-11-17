var roundView = require('../round/view/main');
var layout = require('../layout');
var menu = require('../menu');
var overlay = require('./overlay');
var Chessground = require('chessground');
var utils = require('../utils');

module.exports = function(ctrl) {
  function header() {
    var children = [
      m('nav', [
        m('a.fa.fa-navicon', { config: utils.ontouchstart(ctrl.menu.toggle) }),
        m('h1', ctrl.title()),
        m('a.fa.fa-trophy', {
          config: utils.ontouchstart(ctrl.overlay.open),
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
      m('button', { config: utils.ontouchstart(ctrl.startAIGame) }, 'Start AI!'),
      m('button', { config: utils.ontouchstart(ctrl.seekHumanGame) }, 'Start Human!')
    ];
    if (ctrl.playing())
      return [roundView.renderPlayer(ctrl.round), buttons];
    else
      return [m('section.player', [m('div.infos')]), buttons];
  }

  return layout(ctrl, header, board, footer, menu.view, utils.partial(overlay.view, ctrl.overlay));
};
