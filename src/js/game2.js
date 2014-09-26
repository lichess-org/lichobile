'use strict';

var chessground = require('chessground');
var m           = require('mithril');
var model       = require('./model');
var clock       = require('./clock2');

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
      "color": "white",
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

  this.clock = {
    player: new clock.controller(true, this.play.clock[this.play.player.color]),
    opponent: new clock.controller(false, this.play.clock[model.negate(this.play.player.color)])
  }

};

var view = function(ctrl) {
  function renderGame(ctrl){
    return m('div.content', [
        renderPlayer(ctrl),
        renderBoard(ctrl),
        renderOponnent(ctrl)
    ]);
  }

  function renderPlayer(ctrl){
    return m('div.player', [
      m('h1', [ctrl.play.player.id]),
      m('span', [ctrl.play.player.rating]),
      clock.view(ctrl.clock.player)
    ]);
  }

  function renderOponnent(ctrl){
    var name  = ( "id" in ctrl.play.opponent ? ctrl.play.opponent.id : "AI" );

    return m('div.player', [
      m('h1', [name]),
      m('span', [ctrl.play.opponent.rating]),
      clock.view(ctrl.clock.opponent)
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