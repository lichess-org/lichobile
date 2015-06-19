var merge = require('merge');
var m = require('mithril');
var chess = require('./chess');
var puzzle = require('./puzzle');
var util = require('chessground').util;

module.exports = function(cfg) {

  var data = {
    game: {
      variant: {
        key: 'standard'
      }
    },
    player: {
      color: cfg.puzzle.color
    },
    puzzle: {
      opponentColor: util.opposite(cfg.puzzle.color)
    },
    progress: [],
    chess: chess.make(cfg.puzzle.fen)
  };

  merge.recursive(data, cfg);

  data.puzzle.move = puzzle.str2move(data.puzzle.move);

  return data;
};
