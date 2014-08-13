'use strict';

var _ = require('lodash');
var Clock = require('./clock');

// Object that holds game data and receives updates from server
var Game = function(data) {
  var game = {};
  var player = {};
  var opponent = {};
  var possibleMoves = {};
  var url = {};
  var timer = null;
  var clocks = { white: null, black: null };

  if (_.isObject(data)) {
    game = data.game;
    player = data.player;
    opponent = data.opponent;
    possibleMoves = data.possibleMoves;
    timer = data.clock;
    url = data.url;
  }

  function updateState(state) {
    game.player = state.color;
    game.turns = state.turns;
  }

  function getFen() {
    return game.fen;
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

  function currentPlayer() {
    return game.player;
  }

  function currentTurn() {
    return game.turns;
  }

  function lastMove() {
    return {
      from: game.lastMove.substr(0,2),
      to: game.lastMove.substr(2, 2)
    };
  }

  function setClocks(oppEl, playerEl) {
    var wTime = Math.round(parseFloat(timer.white) * 1000);
    var bTime = Math.round(parseFloat(timer.black) * 1000);
    if (hasClock()) {
      if (player.color === 'white') {
        clocks.white = Clock(wTime, playerEl);
        clocks.black = Clock(bTime, oppEl);
      } else {
        clocks.white = Clock(wTime, oppEl);
        clocks.black = Clock(bTime, playerEl);
      }
      clocks.white.show();
      clocks.black.show();
    }
  }

  function updateClocks(times) {
    stopClocks();
    if (times) {
      for (var color in times) {
        clocks[color].setTime(times[color]);
      }
    } else if (timer) {
      clocks.white.setTime(timer.white);
      clocks.black.setTime(timer.black);
    }
    if (hasClock() && game.started && !game.finished && ((game.turns - game.startedAtTurn) > 1)) {
      clocks[game.player].start();
    }
  }

  function stopClocks() {
    if (clocks.white) clocks.white.stop();
    if (clocks.black) clocks.black.stop();
  }

  function hasClock() {
    return game.clock;
  }

  function finish() {
    game.finished = true;
  }

  function isFinished() {
    return game.finished;
  }

  return {
    // public properties
    url: url,
    player: player,
    opponent: opponent,
    speed: game.speed,
    perf: game.perf,
    variant: game.variant,

    // public methods
    updateState: updateState,
    finish: finish,

    getFen: getFen,
    getPossibleMoves: getPossibleMoves,
    setPossibleMoves: setPossibleMoves,
    isOpponentToMove: isOpponentToMove,
    isMoveAllowed: isMoveAllowed,
    currentTurn: currentTurn,
    currentPlayer: currentPlayer,
    lastPlayer: lastPlayer,
    lastMove: lastMove,
    setClocks: setClocks,
    updateClocks: updateClocks,
    stopClocks: stopClocks,
    hasClock: hasClock,
    isFinished: isFinished
  };
};

module.exports = Game;
