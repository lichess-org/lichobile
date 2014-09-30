var merge = require('lodash-node/modern/objects/merge')
var board = require('./board');
var fen = require('./fen');

module.exports = function(data, config) {

  // don't merge destinations...
  var dests;
  if (config.movable) {
    dests = config.movable.dests;
    delete config.movable.dests;
  }

  merge(data, config);

  // ...but use the new ones instead
  if (dests !== undefined)
    data.movable.dests = dests;

  // if a fen was provided, replace the pieces
  if (data.fen) {
    data.pieces = fen.read(data.fen);
    delete data.fen;
  }

  // forget about the last dropped piece
  data.movable.dropped = [];

  // fix move/premove dests
  if (data.selected) board.setSelected(data, data.selected);

  // no need for such short animations
  if (data.animation.duration < 10) data.animation.enabled = false;
};
