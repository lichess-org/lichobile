import Chessground from '../../chessground/Chessground'
import * as cg from '../../chessground/interfaces'
import settings from '../../settings'
import { AnalyseData } from '../../lichess/interfaces/analyse'


function makeConfig(
  data: AnalyseData,
  config: cg.SetConfig,
  orientation: Color,
  onMove: (orig: Key, dest: Key, capturedPiece?: Piece) => void,
  onNewPiece: (piece: Piece, pos: Key) => void
): cg.InitConfig {
  const pieceMoveConf = settings.game.pieceMove()
  return {
    fen: config.fen,
    check: config.check,
    lastMove: config.lastMove,
    turnColor: config.turnColor,
    orientation,
    coordinates: settings.game.coords(),
    movable: {
      free: false,
      color: config.movableColor,
      dests: config.dests,
      showDests: settings.game.pieceDestinations(),
      rookCastle: settings.game.rookCastle() === 1,
    },
    draggable: {
      enabled: pieceMoveConf === 'drag' || pieceMoveConf === 'both',
      magnified: settings.game.magnified()
    },
    selectable: {
      enabled: pieceMoveConf === 'tap' || pieceMoveConf === 'both'
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
