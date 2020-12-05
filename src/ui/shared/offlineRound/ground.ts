import Chessground from '../../../chessground/Chessground'
import * as cg from '../../../chessground/interfaces'
import * as gameApi from '../../../lichess/game'
import settings from '../../../settings'
import { boardOrientation, animationDuration } from '../../../utils'
import { OfflineGameData } from '../../../lichess/interfaces/game'
import { AfterMoveMeta } from '../../../lichess/interfaces/move'
import { uciToMoveOrDrop } from '../../../utils/chessFormat'
import { GameSituation } from '../../../chess'

function makeConfig(data: OfflineGameData, sit: GameSituation): cg.InitConfig {
  const lastUci = sit.uciMoves.length ? sit.uciMoves[sit.uciMoves.length - 1] : null
  const pieceMoveConf = settings.game.pieceMove()
  return {
    fen: sit.fen,
    orientation: boardOrientation(data),
    turnColor: sit.player,
    lastMove: lastUci ? uciToMoveOrDrop(lastUci) : null,
    check: sit.check,
    otb: data.game.id === 'offline_otb',
    coordinates: settings.game.coords(),
    otbMode: settings.otb.flipPieces() ? 'flip' : 'facing',
    symmetricCoordinates: data.game.id === 'offline_otb',
    autoCastle: true,
    highlight: {
      lastMove: settings.game.highlights(),
      check: settings.game.highlights()
    },
    movable: {
      free: false,
      color: gameApi.isPlayerPlaying(data) ? sit.player : null,
      showDests: settings.game.pieceDestinations(),
      dests: sit.dests,
      rookCastle: settings.game.rookCastle() === 1,
    },
    animation: {
      enabled: !!settings.game.animations(),
      duration: animationDuration(settings.game.animations()),
    },
    premovable: {
      enabled: false
    },
    draggable: {
      enabled: pieceMoveConf === 'drag' || pieceMoveConf === 'both',
      centerPiece: data.pref.centerPiece,
      distance: 3,
      magnified: settings.game.magnified()
    },
    selectable: {
      enabled: pieceMoveConf === 'tap' || pieceMoveConf === 'both'
    },
  }
}

function make(
  data: OfflineGameData,
  sit: GameSituation,
  userMove: (orig: Key, dest: Key, meta: AfterMoveMeta) => void,
  userNewPiece: (role: Role, key: Key, meta: AfterMoveMeta) => void,
  onMove: (orig: Key, dest: Key, capturedPiece?: Piece) => void,
  onNewPiece: () => void
) {
  const config = makeConfig(data, sit)
  config.movable!.events = {
    after: userMove,
    afterNewPiece: userNewPiece
  }
  config.events = {
    move: onMove,
    dropNewPiece: onNewPiece
  }
  return new Chessground(config)
}

function reload(ground: Chessground, data: OfflineGameData, sit: GameSituation) {
  ground.reconfigure(makeConfig(data, sit))
}

function changeOTBMode(ground: Chessground, flip: boolean) {
  ground.setOtbMode(flip ? 'flip' : 'facing')
}

function end(ground: Chessground) {
  ground.stop()
}

export default {
  make,
  reload,
  end,
  changeOTBMode
}
