'use strict';

var round        = require('./round');

module.exports = function() {
  this.round = new round.controller();
};
