var Chessground = require('chessground');
var clock = require('../clock');
var util = require('../util');

function renderPlayer(ctrl){
  var clockRunningColor = ctrl.isClockRunning() ? ctrl.data.game.player : null;
  var children = [
    m('div.infos', [
      m('h2', 'player'),
      m('h3', '1459')
    ])
  ];
  if (ctrl.clock)
    children.push(clock.view(ctrl.clock, ctrl.data.player.color, clockRunningColor));
  return m('section.player', children);
}

function renderOpponent(ctrl){
  var clockRunningColor = ctrl.isClockRunning() ? ctrl.data.game.player : null;
  var children = [
    m('div.infos', [
      m('h2', 'ai'),
      m('h3', '1854')
    ])
  ];
  if (ctrl.clock)
    children.push(clock.view(ctrl.clock, util.opponentColor(ctrl.data.player.color), clockRunningColor));

  return m('section.opponent', children);
}

function renderBoard(ctrl){
  return m('section#board.grey.merida', [
    Chessground.view(ctrl.chessground)
  ]);
}

module.exports = {
  renderBoard: renderBoard,
  renderPlayer: renderPlayer,
  renderOpponent: renderOpponent
};
