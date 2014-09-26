'use strict';

var chessground = require('chessground');
var m = require('mithril');

var controller = function(){

  // https://github.com/ornicar/lila/blob/master/doc/mobile/play.md
  this.play = {
    "game": {
      "id": "39b12Ikl",
      "variant": "chess960", // standard/chess960/fromPosition/kingOfTheHill/threeCheck
      "speed": "blitz", // bullet|blitz|classical|unlimited
      "perf": "chess960", // bullet|blitz|classical|chess960|kingOfTheHill|threeCheck
      "rated": true,
      "clock": false,
      "clockRunning": false,
      "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      "finished": false,
      "lastMove": null,
      "moves": "e4 d5 exd5 Qxd5 Nc3",
      "player": "white",
      "started": true,
      "startedAtTurn": 0,
      "turns": 5
    },
    "clock": {
      // all durations are expressed in seconds
      "initial": 300,           // initial time of the clock, here 5 minutes
      "increment": 8,           // fisher increment
      "black": 36.0,            // current time left for black
      "white": 78.0,            // current time left for white
      "emerg": 30               // critical threshold
    },
    "player": {
      "color": "black",
      "id": "toto",
      "rating": 1954
    },
    "opponent": {
      "id": "Jean",
      "rating": 1154,
    },
    "possibleMoves": {          // list of moves you can play. Empty if not your turn to play.
      "a2": "a3a4",             // from a2, you can go on a3 or a4.
      "b1": "a3c3"
    },
  };

  this.chessground = new chessground.controller({
    orientation: this.play.player.color,
    movable: {
      free: false,
      color: 'both',
      dropOff: 'trash'
    },
    premovable: {
      enabled: true
    }
  });

};

var view = function(ctrl) {
  function renderGame(ctrl){
    return m('div.content', [
        renderPlayer(ctrl.play),
        renderBoard(ctrl),
        renderOponnent(ctrl.play)
    ]);
  }

  function renderPlayer(play){
    return m('div.player', [
      m('h1', [play.player.id]),
      m('span', [play.player.rating]),
      m('div.clock', [play.clock[play.player.color]])
    ]);
  }

  function renderOponnent(play){
    var color = ( play.player.color === "white" ? "black" : "white" );
    var name  = ( "id" in play.opponent ? play.opponent.id : "AI" );

    return m('div.player', [
      m('h1', [name]),
      m('span', [play.opponent.rating]),
      m('div.clock', [play.clock[color]])
    ]);
  }

  function renderBoard(ctrl){
    return m('div.chessground.wood.merida', [
      chessground.view(ctrl.chessground)
    ]);
  }

  return renderGame(ctrl)
};

module.exports = {
  controller: controller,
  view: view
};