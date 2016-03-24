import chessground from 'chessground-mobile';
import settings from '../../settings';
import helper from '../helper';

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
      dests: config.movable.dests
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
  getBounds(isPortrait) {
    const { vh, vw } = helper.viewportDim();
    const top = 50;

    if (isPortrait) {
      const pSide = vw;
      return {
        top,
        right: pSide,
        bottom: top + pSide,
        left: 0,
        width: pSide,
        height: pSide
      };
    } else {
      const lSide = vh - top;
      return {
        top,
        right: lSide,
        bottom: top + lSide,
        left: 0,
        width: lSide,
        height: lSide
      };
    }
  },

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
