'use strict';

var _ = require('lodash');

var Game = function(id) {
  this.is = id;
  this.player = null;
  this.possibleMoves = null;
  this.turns = 0;
};

Game.prototype = {
  isOpponentToMove: function(color) {
    return color !== this.player;
  },
  isMoveAllowed: function(from, to) {
    var m = this.possibleMoves[from];
    return m && _.indexOf(m.match(/.{1,2}/g), to) !== -1;
  }
};

module.exports = Game;
