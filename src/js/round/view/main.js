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
    m('div.infos')
  ];
  if (ctrl.clock)
    children.push(clock.view(ctrl.clock, ctrl.data.player.color, clockRunningColor));
  return m('section.player', children);
}

function renderOpponent(ctrl){
  function renderOpponentInfo(ctrl) {
    var opp = ctrl.data.opponent;
    if (opp.ai) return [ m('h2', 'Stockfish level ' + opp.ai) ];
    else if (opp.user) return [ m('h2', opp.user.id), m('h3', opp.rating) ];
    else return [ m('h2', 'Anonymous') ];
  }

  var clockRunningColor = ctrl.isClockRunning() ? ctrl.data.game.player : null;
  var children = [
    m('div.infos', renderOpponentInfo(ctrl))
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
