import chessground from '../../chessground';
import settings from '../../settings';
import { batchRequestAnimationFrame } from '../../utils/batchRAF';

import { AnalysisData } from './interfaces';

function makeConfig(
  data: AnalysisData,
  config: Chessground.SetConfig,
  orientation: Color,
  onMove: (orig: Pos, dest: Pos, capture: boolean) => void,
  onNewPiece: (piece: Piece, pos: Pos) => void
) {
  return {
    fen: config.fen,
    batchRAF: batchRequestAnimationFrame,
    check: config.check,
    lastMove: config.lastMove,
    turnColor: config.turnColor,
    orientation,
    coordinates: settings.game.coords(),
    movable: {
      free: false,
      color: config.movableColor,
      dests: config.dests,
      showDests: settings.game.pieceDestinations()
    },
    draggable: {
      magnified: settings.game.magnified()
    },
    events: {
      move: onMove,
      dropNewPiece: onNewPiece
    },
    premovable: {
      enabled: false
    },
    highlight: {
      lastMove: settings.game.highlights(),
      check: settings.game.highlights()
    },
    animation: {
      enabled: settings.game.animations(),
      duration: data.pref.animationDuration
    }
  };
}

export default {
  make(
    data: AnalysisData,
    config: Chessground.SetConfig,
    orientation: Color,
    onMove: (orig: Pos, dest: Pos, capture: boolean) => void,
    onNewPiece: (piece: Piece, pos: Pos) => void
  ) {
    return new chessground.controller(makeConfig(data, config, orientation, onMove, onNewPiece));
  },

  promote(ground: Chessground.Controller, key: Pos, role: Role) {
    const pieces = {};
    const piece = ground.data.pieces[key];
    if (piece && piece.role === 'pawn') {
      pieces[key] = {
        color: piece.color,
        role: role
      };
      ground.setPieces(pieces);
    }
  }

};
