'use strict';

var game        = require('./game');

module.exports = function() {
  this.game = new game.controller();
};
