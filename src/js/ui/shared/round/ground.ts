import Chessground from '../../../chessground/Chessground'
import * as cg from '../../../chessground/interfaces'
import redraw from '../../../utils/redraw'
import { batchRequestAnimationFrame } from '../../../utils/batchRAF'
import * as gameApi from '../../../lichess/game'
import { OnlineGameData } from '../../../lichess/interfaces/game'
import { AfterMoveMeta } from '../../../lichess/interfaces/move'
import settings from '../../../settings'
import { boardOrientation } from '../../../utils'
import * as chessFormat from '../../../utils/chessFormat'

function makeConfig(data: OnlineGameData, fen: string, flip: boolean = false): cg.InitConfig {
  const lastStep = data.steps[data.steps.length - 1]
  const lastMove = data.game.lastMove ?
    chessFormat.uciToMove(data.game.lastMove) :
    (
      data.game.variant.key === 'crazyhouse' &&
      lastStep &&
      lastStep.uci !== null
    ) ?
      chessFormat.uciTolastDrop(lastStep.uci) :
      null

  return {
    fen: fen,
    batchRAF: batchRequestAnimationFrame,
    orientation: boardOrientation(data, flip),
    turnColor: data.game.player,
    lastMove,
    check: lastStep.check,
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
      magnified: settings.game.magnified(),
      preventDefault: data.game.variant.key !== 'crazyhouse'
    }
  }
}

function make(
  data: OnlineGameData,
  fen: string,
  userMove: (orig: Key, dest: Key, meta: AfterMoveMeta) => void,
  userNewPiece: (role: Role, key: Key, meta: AfterMoveMeta) => void,
  onMove: (orig: Key, dest: Key, capturedPiece?: Piece) => void,
  onNewPiece: () => void
): Chessground {
  const config = makeConfig(data, fen)
  config.movable!.events = {
    after: userMove,
    afterNewPiece: userNewPiece
  }
  config.events = {
    move: onMove,
    dropNewPiece: onNewPiece
  }
  config.viewOnly = data.player.spectator
  return new Chessground(config)
}

function reload(ground: Chessground, data: OnlineGameData, fen: string, flip: boolean) {
  ground.reconfigure(makeConfig(data, fen, flip))
}

function promote(ground: Chessground, key: Key, role: Role) {
  const pieces: cg.Pieces = {}
  const piece = ground.state.pieces[key]
  if (piece && piece.role === 'pawn') {
    pieces[key] = {
      color: piece.color,
      role: role
    }
    ground.setPieces(pieces)
  }
}

export default {
  make,
  reload,
  promote
}
