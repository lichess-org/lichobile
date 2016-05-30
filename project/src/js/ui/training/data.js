import merge from 'lodash/merge';
import chess from './chess';
import puzzle from './puzzle';
import { oppositeColor } from '../../utils';

export default function(cfg) {

  const sit = chess.make(cfg.puzzle.fen);

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
    playHistory: [{
      fen: sit.fen(),
      dests: sit.dests(),
      check: sit.in_check(),
      turnColor: sit.turn() === 'w' ? 'white' : 'black'
    }],
    chess: sit
  };

  cfg.puzzle.initialMove = puzzle.str2move(cfg.puzzle.initialMove);

  return merge({}, defaults, cfg);
}
