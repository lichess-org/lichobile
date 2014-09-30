var board = require('./board');
var data = require('./data');
var fen = require('./fen');
var configure = require('./configure');
var anim = require('./anim');

module.exports = function(cfg) {

  this.data = data(cfg);

  this.getFen = function() {
    return fen.write(this.data.pieces);
  }.bind(this);

  this.reconfigure = anim(configure, this.data);

  this.toggleOrientation = anim(board.toggleOrientation, this.data);

  this.setPieces = anim(board.setPieces, this.data);

  this.selectSquare = anim(board.selectSquare, this.data, true);

  this.apiMove = anim(board.apiMove, this.data);

  this.playPremove = anim(board.playPremove, this.data);

  this.setCheck = anim(board.setCheck, this.data, true);
};
