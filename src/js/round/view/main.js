'use strict';

var m = require('mithril');
var Chessground = require('chessground');
var clock = require('./clock');

module.exports = function(ctrl) {
  function renderGame(ctrl){
    return m('div', [
        renderOpponent(ctrl),
        renderBoard(ctrl),
        renderPlayer(ctrl),
        m('button', { config: function(el, isUpdate) {
          if (!isUpdate) el.addEventListener('touchstart', ctrl.startAiGame);
        }}, 'Start!')
    ]);
  }

  function renderPlayer(ctrl){
    var children = [
      m('h1', 'player'),
      m('span', '1459')
    ];
    if (ctrl.clocks.player) children.push(clock.view(ctrl.clocks.player), m('div.timer.after'));
    return m('div.player', children);
  }

  function renderOpponent(ctrl){
    // var name  = ( "id" in ctrl.game.opponent ? ctrl.game.opponent.id : "AI" );
    var children = [
      m('h1', 'ai'),
      m('span', '1459')
    ];
    if (ctrl.clocks.opponent) children.push(clock.view(ctrl.clocks.opponent), m('div.timer.before'));

    return m('div.opponent', children);
  }

  function renderBoard(ctrl){
    return m('div.chessground.wood.merida.withMoved.withDest', [
      Chessground.view(ctrl.ground)
    ]);
  }

  return renderGame(ctrl);
};
