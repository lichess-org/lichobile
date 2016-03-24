import chessground from 'chessground-mobile';
import gameApi from '../../lichess/game';
import settings from '../../settings';
import helper from '../helper';

function str2move(m) {
  return m ? [m.slice(0, 2), m.slice(2, 4)] : null;
}

function boardOrientation(data, flip) {
  if (data.game.variant.key === 'racingKings') {
    return flip ? 'black' : 'white';
  } else {
    return flip ? data.opponent.color : data.player.color;
  }
}

function getBounds(isPortrait) {
  const { vh, vw } = helper.viewportDim();
  const top = 50;

  if (isPortrait) {
    const contentHeight = vh - 50;
    const pTop = 50 + ((contentHeight - vw - 40) / 2);
    return {
      top: pTop,
      right: vw,
      bottom: pTop + vw,
      left: 0,
      width: vw,
      height: vw
    };
  } else if (helper.isVeryWideScreen()) {
    const wsSide = vh - top - (vh * 0.88);
    return {
      top,
      right: wsSide,
      bottom: top + wsSide,
      left: 0,
      width: wsSide,
      height: wsSide
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
      check: settings.game.highlights(),
      dragOver: false
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
      castle: data.game.variant.key !== 'antichess'
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

module.exports = {
  make,
  reload,
  promote,
  end,
  applySettings,
  boardOrientation,
  getBounds
};
