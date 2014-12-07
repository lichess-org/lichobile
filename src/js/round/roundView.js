var chessground = require('chessground');
var clock = require('./clock');
var renderPromotion = require('./promotion').view;
var utils = require('../utils');

function renderMaterial(ctrl, color) {
  var material = chessground.board.getMaterialDiff(ctrl.chessground.data)[color];
  var children = [];
  for (var role in material) {
    var piece = m('div.' + role);
    var count = material[role];
    var content;
    if (count === 1) content = piece;
    else {
      content = [];
      for (var i = 0; i < count; i++) content.push(piece);
    }
    children.push(m('div.tomb', content));
  }
  return m('div.material', children);
}

function renderPlayer(ctrl) {
  var player = ctrl.data.player;
  return m('section.player', [
    m('div.infos', [
      m('h2', player.user ? player.user.username : 'You'),
      m('div.under', [
        player.user ? m('h3.rating', player.rating) : null,
        renderMaterial(ctrl, player.color)
      ])
    ]),
    ctrl.clock ? clock.view(ctrl.clock, ctrl.data.player.color, ctrl.isClockRunning() ? player : null) : null
  ]);
}

function renderOpponent(ctrl) {

  var opp = ctrl.data.opponent;

  function renderOpponentInfo() {
    if (opp.ai) return m('h2', 'Stockfish level ' + opp.ai);
    else if (opp.user) return m('h2', opp.user.id), m('h3.rating', opp.rating);
    else return m('h2', 'Anonymous');
  }

  var clockRunningColor = ctrl.isClockRunning() ? ctrl.data.game.player : null;
  var children = [
    m('div.infos', [
      renderOpponentInfo(),
      renderMaterial(ctrl, opp.color)
    ])
  ];
  if (ctrl.clock)
    children.push(clock.view(ctrl.clock, opp.color, clockRunningColor));

  return m('section.opponent', children);
}

function renderBoard(ctrl) {
  var vw = utils.getViewportDims().vw;
  return m('section#board.grey.merida', {
    style: {
      height: vw + 'px'
    }
  }, [
    chessground.view(ctrl.chessground), renderPromotion(ctrl)
  ]);
}

module.exports = {
  renderBoard: renderBoard,
  renderPlayer: renderPlayer,
  renderOpponent: renderOpponent
};
