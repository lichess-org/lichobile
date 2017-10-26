import * as merge from 'lodash/merge'
import chess from './chess'
import puzzle from './puzzle'
import { oppositeColor } from '../../utils'
import { PuzzleData } from '../../lichess/interfaces/training'

import { Data } from './interfaces'

export default function(cfg: PuzzleData): Data {

  const sit = chess.make(cfg.puzzle.fen)

  const defaults = {
    game: {
      variant: {
        key: 'standard' as VariantKey
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
  }

  cfg.puzzle.initialMove = puzzle.str2move(cfg.puzzle.initialMove) as KeyPair

  return merge({}, defaults, cfg)
}
