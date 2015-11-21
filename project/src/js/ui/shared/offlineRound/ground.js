import chessground from 'chessground';
import gameApi from '../../../lichess/game';
import settings from '../../../settings';

function makeConfig(data, fen) {
  return {
    fen: fen,
    orientation: data.player.color,
    turnColor: data.game.player,
    coordinates: settings.game.coords(),
    autoCastle: data.game.variant.key === 'standard',
    highlight: {
      lastMove: data.pref.highlight,
      check: data.pref.highlight,
      dragOver: false
    },
    movable: {
      free: false,
      color: gameApi.isPlayerPlaying(data) ? data.player.color : null,
      showDests: settings.game.pieceDestinations()
    },
    animation: {
      enabled: settings.game.animations(),
      duration: 300
    },
    premovable: {
      enabled: false
    },
    draggable: {
      showGhost: data.pref.highlight,
      centerPiece: data.pref.centerPiece,
      distance: 3,
      squareTarget: true
    }
  };
}

function applySettings(ground) {
  ground.set({
    movable: {
      showDests: settings.game.pieceDestinations()
    },
    animation: {
      enabled: settings.game.animations()
    },
    premovable: {
      showDests: settings.game.pieceDestinations()
    }
  });
}

function make(data, fen, userMove, onMove) {
  var config = makeConfig(data, fen);
  config.movable.events = {
    after: userMove
  };
  config.events = {
    move: onMove
  };
  return new chessground.controller(config);
}

function reload(ground, data, fen) {
  ground.set(makeConfig(data, fen));
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
  end,
  applySettings
};
