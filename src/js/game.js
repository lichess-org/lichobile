'use strict';

var _ = require('lodash');
var Clock = require('./clock');

var Game = function(data) {
  this.game = {};
  this.player = {};
  this.opponent = {};
  this.possibleMoves = {};
  this.pref = {};
  this.url = {};
  this.clock = null;
  this.clocks = { white: null, black: null };

  if (_.isObject(data)) {
    this.game = data.game;
    this.player = data.player;
    this.opponent = data.opponent;
    this.possibleMoves = data.possibleMoves;
    this.clock = data.clock;
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
  },
  lastPlayer: function() {
    return (this.game.player === 'white') ? 'black' : 'white';
  },
  setClocks: function($topC, $botC) {
    var wTime = Math.round(parseFloat(this.clock.white) * 1000);
    var bTime = Math.round(parseFloat(this.clock.black) * 1000);
    if (this.game.clock) {
      if (this.player.color === 'white') {
        this.clocks.white = Clock(wTime, $botC);
        this.clocks.black = Clock(bTime, $topC);
      } else {
        this.clocks.white = Clock(wTime, $topC);
        this.clocks.black = Clock(bTime, $botC);
      }
      this.clocks.white.show();
      this.clocks.black.show();
    }
  },
  updateClocks: function(times) {
    if (times) {
      for (var color in times) {
        this.clocks[color].setTime(times[color]);
      }
    }
    this.stopClocks();
    if (this.hasClock() && !this.game.finished && ((this.game.turns - this.game.startedAtTurn) > 1 || this.game.clockRunning)) {
      this.clocks[this.game.player].start();
    }
  },
  startClock: function() {
    this.clocks[this.game.player].start();
  },
  stopClocks: function() {
    this.clocks.white.stop();
    this.clocks.black.stop();
  },
  hasClock: function() {
    return this.game.clock && this.game.started;
  }
};

module.exports = Game;
