import chessground from '../../../chessground';
import * as gameApi from '../../../lichess/game';
import settings from '../../../settings';
import { boardOrientation } from '../../../utils';
import { batchRequestAnimationFrame } from '../../../utils/batchRAF';

function makeConfig(data, sit) {
  const lastUci = sit.uciMoves.length ? sit.uciMoves[sit.uciMoves.length - 1] : null;
  return {
    batchRAF: batchRequestAnimationFrame,
    fen: sit.fen,
    orientation: boardOrientation(data),
    turnColor: sit.player,
    lastMove: lastUci ? [lastUci.slice(0, 2), lastUci.slice(2, 4)] : null,
    check: sit.check,
    coordinates: settings.game.coords(),
    symmetricCoordinates: data.game.id === 'offline_otb',
    autoCastle: data.game.variant.key === 'standard',
    highlight: {
      lastMove: settings.game.highlights(),
      check: settings.game.highlights(),
      dragOver: false
    },
    movable: {
      free: false,
      color: gameApi.isPlayerPlaying(data) ? sit.player : null,
      showDests: settings.game.pieceDestinations(),
      dests: sit.dests
    },
    animation: {
      enabled: settings.game.animations(),
      duration: 300
    },
    premovable: {
      enabled: false
    },
    draggable: {
      centerPiece: data.pref.centerPiece,
      distance: 3,
      squareTarget: true,
      magnified: settings.game.magnified()
    }
  };
}

function make(data, sit, userMove, userNewPiece, onMove, onNewPiece) {
  var config = makeConfig(data, sit);
  config.movable.events = {
    after: userMove,
    afterNewPiece: userNewPiece
  };
  config.events = {
    move: onMove,
    dropNewPiece: onNewPiece
  };
  return new chessground.controller(config);
}

function reload(ground, data, sit) {
  ground.reconfigure(makeConfig(data, sit));
}

function promote(ground, key, role) {
  var pieces = {};
  var piece = ground.data.pieces[key];
  if (piece && piece.role === 'pawn') {
    pieces[key] = {
      color: piece.color,
      role: role
    };
    ground.setPieces(pieces);
  }
}

function end(ground) {
  ground.stop();
}

export default {
  make,
  reload,
  promote,
  end
};
