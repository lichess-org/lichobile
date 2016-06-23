import chessground from 'chessground-mobile';
import settings from '../../settings';

function makeConfig(data, config, onMove, onNewPiece) {
  return {
    fen: config.fen,
    check: config.check,
    lastMove: config.lastMove,
    orientation: data.orientation,
    coordinates: settings.game.coords(),
    movable: {
      free: false,
      color: config.movable.color,
      dests: config.movable.dests,
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
      enabled: true
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
  make(data, config, onMove, onNewPiece) {
    return new chessground.controller(makeConfig(data, config, onMove, onNewPiece));
  },

  promote(ground, key, role) {
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
