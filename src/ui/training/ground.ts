import * as cg from '../../chessground/interfaces'
import settings from '../../settings'
import { batchRequestAnimationFrame } from '../../utils/batchRAF'

import TrainingCtrl from './TrainingCtrl'

export default function makeConfig(
  ctrl: TrainingCtrl,
  userMove: (orig: Key, dest: Key) => void,
  onMove: (orig: Key, dest: Key, capture?: Piece) => void): cg.InitConfig {
  return {
    batchRAF: batchRequestAnimationFrame,
    fen: ctrl.data.puzzle.fen,
    orientation: ctrl.data.puzzle.color,
    coordinates: settings.game.coords(),
    turnColor: ctrl.data.puzzle.opponentColor,
    highlight: {
      lastMove: settings.game.highlights(),
      check: settings.game.highlights()
    },
    movable: {
      free: false,
      color: ctrl.data.mode !== 'view' ? ctrl.data.puzzle.color : null,
      showDests: settings.game.pieceDestinations(),
      events: {
        after: userMove
      }
    },
    events: {
      move: onMove
    },
    animation: {
      enabled: true,
      duration: 300
    },
    premovable: {
      enabled: false
    },
    draggable: {
      distance: 3,
      magnified: settings.game.magnified()
    }
  }
}
