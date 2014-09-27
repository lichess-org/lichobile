var partial = require('lodash-node/modern/functions/partial');
var board = require('./board');
var data = require('./data');
var configure = require('./configure');
var anim = require('./anim');

module.exports = function(cfg) {

  this.data = data(cfg);

  this.reconfigure = anim(configure, this.data);

  this.toggleOrientation = anim(board.toggleOrientation, this.data);

  this.setPieces = anim(board.setPieces, this.data);

  this.selectSquare = partial(board.selectSquare, this.data);

  this.apiMove = partial(board.apiMove, this.data);

  this.playPremove = partial(board.playPremove, this.data);
};
