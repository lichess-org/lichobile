import chessground from 'chessground-mobile';

function makeConfig(data, config, onMove, onNewPiece) {
  return {
    fen: config.fen,
    check: config.check,
    lastMove: config.lastMove,
    orientation: data.orientation,
    coordinates: data.pref.coords !== 0,
    movable: {
      free: false,
      color: config.movable.color,
      dests: config.movable.dests
    },
    events: {
      move: onMove,
      dropNewPiece: onNewPiece
    },
    premovable: {
      enabled: true
    },
    drawable: {
      enabled: true
    },
    highlight: {
      lastMove: data.pref.highlight,
      check: data.pref.highlight
    },
    animation: {
      enabled: true,
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
