'use strict';

var _ = require('lodash');

var Game = function(data) {
  this.game = {};
  this.player = {};
  this.opponent = {};
  this.possibleMoves = {};
  this.pref = {};
  this.url = {};

  if (_.isObject(data)) {
    this.game = data.game;
    this.player = data.player;
    this.opponent = data.opponent;
    this.possibleMoves = data.possibleMoves;
    this.pref = data.pref;
    this.url = data.url;
  }
};

Game.prototype = {
  isOpponentToMove: function(color) {
    return color !== this.game.player;
  },
  isMoveAllowed: function(from, to) {
    var m = this.possibleMoves[from];
    return m && _.indexOf(m.match(/.{1,2}/g), to) !== -1;
  }
};

module.exports = Game;
