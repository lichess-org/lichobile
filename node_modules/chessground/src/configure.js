var merge = require('lodash-node/modern/objects/merge')
var fen = require('./fen');

module.exports = function(board, config) {

  merge(board, config);

  if (board.fen) {
    board.pieces = fen.read(board.fen);
    delete board.fen;
  }

  board.movable.dropped = null;
};
