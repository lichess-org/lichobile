var chessground = require('chessground');
var game = require('./game');
var settings = require('../../settings');

function str2move(m) {
  return m ? [m.slice(0, 2), m.slice(2, 4)] : null;
}

function makeConfig(data, fen, flip) {
  return {
    fen: fen,
    orientation: flip ? data.opponent.color : data.player.color,
    turnColor: data.game.player,
    lastMove: str2move(data.game.lastMove),
    check: data.game.check,
    coordinates: data.pref.coords !== 0,
    autoCastle: data.game.variant.key === 'standard',
    highlight: {
      lastMove: data.pref.highlight,
      check: data.pref.highlight,
      dragOver: false
    },
    movable: {
      free: false,
      color: game.isPlayerPlaying(data) ? data.player.color : null,
      dests: game.parsePossibleMoves(data.possibleMoves),
      showDests: settings.general.pieceDestinations()
    },
    animation: {
      enabled: settings.general.animations(),
      duration: data.pref.animationDuration
    },
    premovable: {
      enabled: data.pref.enablePremove,
      showDests: settings.general.pieceDestinations(),
      events: {
        set: m.redraw,
        unset: m.redraw
      }
    },
    draggable: {
      showGhost: data.pref.highlight,
      distance: 3,
      squareTarget: true
    }
  };
}

function make(data, fen, userMove, onCapture) {
  var config = makeConfig(data, fen);
  config.movable.events = {
    after: userMove
  };
  config.events = {
    capture: onCapture
  };
  config.viewOnly = data.player.spectator;
  return new chessground.controller(config);
}

function reload(ground, data, fen, flip) {
  ground.set(makeConfig(data, fen, flip));
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
  end: end
};
