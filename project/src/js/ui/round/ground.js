import chessground from 'chessground-mobile';
import gameApi from '../../lichess/game';
import settings from '../../settings';
import { boardOrientation } from '../../utils';
import m from 'mithril';

function str2move(move) {
  return move ? [move.slice(0, 2), move.slice(2, 4)] : null;
}

function makeConfig(data, fen, flip) {
  return {
    fen: fen,
    orientation: boardOrientation(data, flip),
    turnColor: data.game.player,
    lastMove: str2move(data.game.lastMove),
    check: data.game.check,
    coordinates: settings.game.coords(),
    autoCastle: data.game.variant.key === 'standard',
    highlight: {
      lastMove: settings.game.highlights(),
      check: settings.game.highlights()
    },
    movable: {
      free: false,
      color: gameApi.isPlayerPlaying(data) ? data.player.color : null,
      dests: gameApi.isPlayerPlaying(data) ? gameApi.parsePossibleMoves(data.possibleMoves) : {},
      showDests: settings.game.pieceDestinations()
    },
    animation: {
      enabled: settings.game.animations(),
      duration: data.pref.animationDuration
    },
    premovable: {
      enabled: data.pref.enablePremove,
      showDests: settings.game.pieceDestinations(),
      castle: data.game.variant.key !== 'antichess',
      events: {
        set: () => m.redraw(),
        unset: m.redraw
      }
    },
    draggable: {
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
  config.viewOnly = data.player.spectator;
  return new chessground.controller(config);
}

function reload(ground, data, fen, flip) {
  ground.set(makeConfig(data, fen, flip));
}

function promote(ground, key, role) {
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
