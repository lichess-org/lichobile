import chessground from '../../../chessground';
import redraw from '../../../utils/redraw';
import { batchRequestAnimationFrame } from '../../../utils/batchRAF';
import * as gameApi from '../../../lichess/game';
import settings from '../../../settings';
import { boardOrientation } from '../../../utils';
import * as chessFormat from '../../../utils/chessFormat';
import { AfterMoveMeta } from './';

function makeConfig(data: OnlineGameData, fen: string, flip: boolean = false): any {
  const lastMove = data.game.lastMove ?
    chessFormat.uciToMove(data.game.lastMove) :
    (data.game.variant.key === 'crazyhouse' && data.steps.length > 0 &&
    data.steps[data.steps.length - 1].uci) ?
      chessFormat.uciTolastDrop(data.steps[data.steps.length - 1].uci) :
      null;

  return {
    fen: fen,
    batchRAF: batchRequestAnimationFrame,
    orientation: boardOrientation(data, flip),
    turnColor: data.game.player,
    lastMove,
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
        set: () => redraw(),
        unset: redraw
      }
    },
    predroppable: {
      enabled: data.pref.enablePremove && data.game.variant.key === 'crazyhouse',
      events: {
        set: () => redraw(),
        unset: redraw
      }
    },
    draggable: {
      distance: 3,
      squareTarget: true,
      magnified: settings.game.magnified(),
      preventDefault: data.game.variant.key !== 'crazyhouse'
    }
  };
}

function make(
  data: OnlineGameData,
  fen: string,
  userMove: (orig: Pos, dest: Pos, meta: AfterMoveMeta) => void,
  userNewPiece: (role: Role, key: Pos, meta: AfterMoveMeta) => void,
  onMove: (orig: Pos, dest: Pos, capturedPiece: Piece) => void,
  onNewPiece: () => void
): Chessground.Controller {
  const config = makeConfig(data, fen);
  config.movable.events = {
    after: userMove,
    afterNewPiece: userNewPiece
  };
  config.events = {
    move: onMove,
    dropNewPiece: onNewPiece
  };
  config.viewOnly = data.player.spectator;
  return new chessground.controller(config);
}

function reload(ground: Chessground.Controller, data: OnlineGameData, fen: string, flip: boolean) {
  ground.reconfigure(makeConfig(data, fen, flip));
}

function promote(ground: Chessground.Controller, key: Pos, role: Role) {
  const pieces: Chessground.Pieces = {};
  const piece = ground.data.pieces[key];
  if (piece && piece.role === 'pawn') {
    pieces[key] = {
      color: piece.color,
      role: role
    };
    ground.setPieces(pieces);
  }
}

function end(ground: Chessground.Controller) {
  ground.stop();
}

export default {
  make,
  reload,
  promote,
  end
};
