var merge = require('lodash-node/modern/objects/merge')
var board = require('./board');
var fen = require('./fen');

module.exports = function(data, config) {

  merge(data, config);

  if (data.fen) {
    data.pieces = fen.read(data.fen);
    delete data.fen;
  }

  data.movable.dropped = null;

  // fix move/premove dests
  if (data.selected) board.setSelected(data, data.selected);
};
