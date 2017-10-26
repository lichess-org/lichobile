import * as cg from '../../chessground/interfaces'
import settings from '../../settings'
import { batchRequestAnimationFrame } from '../../utils/batchRAF'

import TrainingCtrl from './TrainingCtrl'

export default function makeConfig(
  ctrl: TrainingCtrl,
  userMove: (orig: Key, dest: Key) => void): cg.InitConfig {
  return {
    batchRAF: batchRequestAnimationFrame,
    fen: ctrl.data.puzzle.fen,
    orientation: ctrl.data.puzzle.color,
    coordinates: settings.game.coords(),
    turnColor: ctrl.node.ply % 2 === 0 ? 'white' : 'black',
    highlight: {
      lastMove: settings.game.highlights(),
      check: settings.game.highlights()
    },
    movable: {
      free: false,
      color: ctrl.data.puzzle.color,
      showDests: settings.game.pieceDestinations()
    },
    events: {
      move: userMove
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
