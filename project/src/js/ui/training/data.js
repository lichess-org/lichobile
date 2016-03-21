import merge from 'lodash/merge';
import chess from './chess';
import puzzle from './puzzle';
import { oppositeColor } from '../../utils';

module.exports = function(cfg) {

  const defaults = {
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

  cfg.puzzle.initialMove = puzzle.str2move(cfg.puzzle.initialMove);

  return merge({}, defaults, cfg);
};
