'use strict';

var m = require('mithril');
var Chessground = require('chessground');
var clock = require('../clock');
var util = require('../util');

module.exports = function(ctrl) {

  function renderGame(ctrl){
    return m('div', [
        renderOpponent(ctrl),
        renderBoard(ctrl),
        renderPlayer(ctrl)
    ]);
  }

  function renderPlayer(ctrl){
    var clockRunningColor = ctrl.isClockRunning() ? ctrl.data.game.player : null;
    var children = [
      m('h1', 'player'),
      m('span', '1459')
    ];
    if (ctrl.clock)
      children.push(clock.view(ctrl.clock, ctrl.data.player.color, clockRunningColor));
    return m('div.player', children);
  }

  function renderOpponent(ctrl){
    var clockRunningColor = ctrl.isClockRunning() ? ctrl.data.game.player : null;
    var children = [
      m('h1', 'ai'),
      m('span', '1459')
    ];
    if (ctrl.clock)
      children.push(clock.view(ctrl.clock, util.opponentColor(ctrl.data.player.color), clockRunningColor));

    return m('div.opponent', children);
  }

  function renderBoard(ctrl){
    return m('div.chessground.wood.merida.withMoved.withDest', [
      Chessground.view(ctrl.chessground)
    ]);
  }

  return renderGame(ctrl);
};
