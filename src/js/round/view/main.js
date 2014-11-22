var chessground = require('chessground');
var clock = require('../clock');
var renderPromotion = require('../promotion').view;
var utils = require('../../utils');

function oppositeColor(c) {
  return c === 'white' ? 'black' : 'white';
}

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
    children.push(clock.view(ctrl.clock, oppositeColor(ctrl.data.player.color), clockRunningColor));

  return m('section.opponent', children);
}

function renderBoard(ctrl){
  var vw = utils.getViewportDims().vw;
  return m('section#board.grey.merida', { style: { height: vw + 'px' }}, [
    chessground.view(ctrl.chessground), renderPromotion(ctrl)
  ]);
}

module.exports = {
  renderBoard: renderBoard,
  renderPlayer: renderPlayer,
  renderOpponent: renderOpponent
};
