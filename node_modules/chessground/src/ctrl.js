var board = require('./board');
var data = require('./data');
var configure = require('./configure');
var anim = require('./anim');

module.exports = function(cfg) {

  this.board = data(cfg);

  this.reconfigure = anim(this.board, configure);

  this.toggleOrientation = anim(this.board, board.toggleOrientation);

  this.setPieces = anim(this.board, board.setPieces);

  this.selectSquare = board.selectSquare.bind(this.board);

  this.apiMove = board.apiMove.bind(this.board);

  this.playPremove = board.playPremove.bind(this.board);
};
