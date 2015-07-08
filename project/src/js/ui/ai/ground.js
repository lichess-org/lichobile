import chessground from 'chessground';
import gameApi from '../../lichess/game';
import settings from '../../settings';

function makeConfig(data, fen) {
  return {
    fen: fen,
    orientation: data.player.color,
    turnColor: data.game.player,
    coordinates: data.pref.coords !== 0,
    autoCastle: data.game.variant.key === 'standard',
    highlight: {
      lastMove: data.pref.highlight,
      check: data.pref.highlight,
      dragOver: false
    },
    movable: {
      free: false,
      color: gameApi.isPlayerPlaying(data) ? data.player.color : null,
      dests: gameApi.parsePossibleMoves(data.possibleMoves),
      showDests: settings.general.pieceDestinations()
    },
    animation: {
      enabled: true,
      duration: 300
    },
    premovable: {
      enabled: false
    },
    draggable: {
      showGhost: data.pref.highlight,
      distance: 3,
      squareTarget: true
    }
  };
}

function applySettings(ground) {
  ground.set({
    movable: {
      showDests: settings.general.pieceDestinations()
    },
    animation: {
      enabled: settings.general.animations()
    },
    premovable: {
      showDests: settings.general.pieceDestinations()
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

module.exports = {
  make: make,
  reload: reload,
  promote: promote,
  end: end,
  applySettings: applySettings
};
