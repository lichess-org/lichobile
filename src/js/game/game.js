'use strict';

var _ = require('lodash');

// Object that holds game lichessData and receives updates from server
module.exports = function(lichessData) {
  var data = {};
  var player = {};
  var opponent = {};
  var possibleMoves = {};
  var url = {};
  var clock = null;

  if (_.isObject(lichessData)) {
    data = lichessData.game;
    player = lichessData.player;
    opponent = lichessData.opponent;
    possibleMoves = lichessData.possibleMoves;
    clock = lichessData.clock;
    url = lichessData.url;
  }

  function fullId() {
    if (player.id) return data.id + player.id;
    return data.id;
  }

  function updateState(state) {
    data.player = state.color;
    data.turns = state.turns;
  }

  function getPossibleMoves() {
    return _.mapValues(possibleMoves, function(moves) {
      return moves.match(/.{2}/g);
    });
  }

  function setPossibleMoves(moves) {
    possibleMoves = moves;
  }

  function isMyTurn() {
    return data.player === player.color;
  }

  function isMoveAllowed(from, to) {
    var m = possibleMoves[from];
    return m && _.indexOf(m.match(/.{2}/g), to) !== -1;
  }

  function lastPlayer() {
    return (data.player === 'white') ? 'black' : 'white';
  }

  function currentPlayer() {
    return data.player;
  }

  function currentTurn() {
    return data.turns;
  }

  function lastMove() {
    return data.lastMove ? {
      from: data.lastMove.substr(0, 2),
      to: data.lastMove.substr(2, 2)
    } : null;
  }

  function hasClock() {
    return data.clock;
  }

  return {
    // public static properties
    url: url,
    player: player,
    opponent: opponent,
    clock: clock,
    speed: data.speed,
    perf: data.perf,
    variant: data.variant,

    // public methods
    updateState: updateState,

    fullId: fullId,
    getPossibleMoves: getPossibleMoves,
    setPossibleMoves: setPossibleMoves,
    isMyTurn: isMyTurn,
    isMoveAllowed: isMoveAllowed,
    currentTurn: currentTurn,
    currentPlayer: currentPlayer,
    lastPlayer: lastPlayer,
    lastMove: lastMove,
    hasClock: hasClock
  };
};

