var partial = require('lodash-node/modern/functions/partial');
var board = require('./board');
var data = require('./data');
var fen = require('./fen');
var configure = require('./configure');
var anim = require('./anim');

module.exports = function(cfg) {

  this.data = data(cfg);

  this.getOrientation = function() { return this.data.orientation; };

  this.getPieces = function() { return this.data.pieces; };

  this.getFen = function() { return fen.write(this.data.pieces); }.bind(this);

  this.reconfigure = anim(configure, this.data);

  this.reset = partial(board.reset, this.data);

  this.toggleOrientation = anim(board.toggleOrientation, this.data);

  this.setPieces = anim(board.setPieces, this.data);

  this.selectSquare = partial(board.selectSquare, this.data);

  this.apiMove = anim(board.apiMove, this.data);

  this.playPremove = anim(board.playPremove, this.data);

};
