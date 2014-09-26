'use strict';

var chessground = require('chessground');
var game        = require('./game2');

module.exports = function() {
  this.game = new game.controller()
};
