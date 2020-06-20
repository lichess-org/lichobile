import * as cg from '../../chessground/interfaces'
import settings from '../../settings'

import TrainingCtrl from './TrainingCtrl'

export default function makeConfig(
  ctrl: TrainingCtrl,
  userMove: (orig: Key, dest: Key) => void): cg.InitConfig {

  const pieceMoveConf = settings.game.pieceMove()

  return {
    fen: ctrl.data.puzzle.fen,
    orientation: ctrl.data.puzzle.color,
    coordinates: settings.game.coords(),
    squareCoordinates: {
      enabled: settings.game.squareCoords.enabled(),
      whiteSquaresOpacity: settings.game.squareCoords.whiteSquaresOpacity(),
      blackSquaresOpacity: settings.game.squareCoords.blackSquaresOpacity()
    },
    turnColor: ctrl.node.ply % 2 === 0 ? 'white' : 'black',
    highlight: {
      lastMove: settings.game.highlights(),
      check: settings.game.highlights()
    },
    movable: {
      free: false,
      color: ctrl.data.puzzle.color,
      showDests: settings.game.pieceDestinations(),
      rookCastle: settings.game.rookCastle() === 1,
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
      enabled: pieceMoveConf === 'drag' || pieceMoveConf === 'both',
      distance: 3,
      magnified: settings.game.magnified()
    },
    selectable: {
      enabled: pieceMoveConf === 'tap' || pieceMoveConf === 'both'
    },
  }
}
