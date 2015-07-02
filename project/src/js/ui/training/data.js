import merge from 'lodash/object/merge';
import chess from './chess';
import puzzle from './puzzle';
import { oppositeColor } from '../../utils';

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
      opponentColor: oppositeColor(cfg.puzzle.color)
    },
    progress: [],
    chess: chess.make(cfg.puzzle.fen)
  };

  merge(data, cfg);

  data.puzzle.move = puzzle.str2move(data.puzzle.move);

  return data;
};
