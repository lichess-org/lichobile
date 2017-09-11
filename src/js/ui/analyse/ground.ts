import Chessground from '../../chessground/Chessground'
import * as cg from '../../chessground/interfaces'
import settings from '../../settings'
import { batchRequestAnimationFrame } from '../../utils/batchRAF'
import { AnalyseData } from '../../lichess/interfaces/analyse'


function makeConfig(
  data: AnalyseData,
  config: cg.SetConfig,
  orientation: Color,
  onMove: (orig: Key, dest: Key, capturedPiece?: Piece) => void,
  onNewPiece: (piece: Piece, pos: Key) => void
): cg.InitConfig {
  return {
    fen: config.fen,
    batchRAF: batchRequestAnimationFrame,
    check: config.check,
    lastMove: config.lastMove,
    turnColor: config.turnColor,
    orientation,
    coordinates: settings.game.coords(),
    movable: {
      free: false,
      color: config.movableColor,
      dests: config.dests,
      showDests: settings.game.pieceDestinations()
    },
    draggable: {
      magnified: settings.game.magnified()
    },
    events: {
      move: onMove,
      dropNewPiece: onNewPiece
    },
    premovable: {
      enabled: false
    },
    highlight: {
      lastMove: settings.game.highlights(),
      check: settings.game.highlights()
    },
    animation: {
      enabled: settings.game.animations(),
      duration: data.pref.animationDuration
    }
  }
}

export default {
  make(
    data: AnalyseData,
    config: cg.SetConfig,
    orientation: Color,
    onMove: (orig: Key, dest: Key, capturedPiece?: Piece) => void,
    onNewPiece: (piece: Piece, pos: Key) => void
  ) {
    return new Chessground(makeConfig(data, config, orientation, onMove, onNewPiece))
  },

  promote(ground: Chessground, key: Key, role: Role) {
    const pieces: {[i: string]: Piece } = {}
    const piece = ground.state.pieces[key]
    if (piece && piece.role === 'pawn') {
      pieces[key] = {
        color: piece.color,
        role: role
      }
      ground.setPieces(pieces)
    }
  }

}
