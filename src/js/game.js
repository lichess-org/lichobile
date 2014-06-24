'use strict';

var _ = require('lodash');
var Clock = require('./clock');

var Game = function(data) {
  var game = {};
  var player = {};
  var opponent = {};
  var possibleMoves = {};
  var pref = {};
  var url = {};
  var clock = null;
  var clocks = { white: null, black: null };

  if (_.isObject(data)) {
    game = data.game;
    player = data.player;
    opponent = data.opponent;
    possibleMoves = data.possibleMoves;
    clock = data.clock;
    pref = data.pref;
    url = data.url;
  }

  function getPossibleMoves() {
    return _.mapValues(possibleMoves, function(moves) {
      return moves.match(/.{1,2}/g);
    });
  }

  function setPossibleMoves(moves) {
    possibleMoves = moves;
  }

  function isOpponentToMove(color) {
    return color !== player.color;
  }

  function isMoveAllowed(from, to) {
    var m = possibleMoves[from];
    return m && _.indexOf(m.match(/.{1,2}/g), to) !== -1;
  }

  function lastPlayer() {
    return (game.player === 'white') ? 'black' : 'white';
  }

  function setClocks($topC, $botC) {
    var wTime = Math.round(parseFloat(clock.white) * 1000);
    var bTime = Math.round(parseFloat(clock.black) * 1000);
    if (game.clock) {
      if (player.color === 'white') {
        clocks.white = Clock(wTime, $botC);
        clocks.black = Clock(bTime, $topC);
      } else {
        clocks.white = Clock(wTime, $topC);
        clocks.black = Clock(bTime, $botC);
      }
      clocks.white.show();
      clocks.black.show();
    }
  }

  function updateClocks(times) {
    if (times) {
      for (var color in times) {
        clocks[color].setTime(times[color]);
      }
    }
    stopClocks();
    if (hasClock() && !game.finished && ((game.turns - game.startedAtTurn) > 1)) {
      clocks[game.player].start();
    }
  }

  function startClock() {
    clocks[game.player].start();
  }

  function stopClocks() {
    clocks.white.stop();
    clocks.black.stop();
  }

  function hasClock() {
    return game.clock && game.started;
  }

  return {
    game: game,
    getPossibleMoves: getPossibleMoves,
    setPossibleMoves: setPossibleMoves,
    isOpponentToMove: isOpponentToMove,
    isMoveAllowed: isMoveAllowed,
    lastPlayer: lastPlayer,
    setClocks: setClocks,
    updateClocks: updateClocks,
    startClock: startClock,
    stopClocks: stopClocks,
    hasClock: hasClock
  };
};

module.exports = Game;
