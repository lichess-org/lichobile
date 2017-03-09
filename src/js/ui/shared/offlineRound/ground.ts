import chessground from '../../../chessground'
import * as gameApi from '../../../lichess/game'
import settings from '../../../settings'
import { OfflineGameData } from '../../../lichess/interfaces/game'
import { AfterMoveMeta } from '../../../lichess/interfaces/move'
import { boardOrientation } from '../../../utils'
import { batchRequestAnimationFrame } from '../../../utils/batchRAF'
import { GameSituation } from '../../../chess'

function makeConfig(data: OfflineGameData, sit: GameSituation): any {
  const lastUci = sit.uciMoves.length ? sit.uciMoves[sit.uciMoves.length - 1] : null
  return {
    batchRAF: batchRequestAnimationFrame,
    fen: sit.fen,
    orientation: boardOrientation(data),
    turnColor: sit.player,
    lastMove: lastUci ? [lastUci.slice(0, 2), lastUci.slice(2, 4)] : null,
    check: sit.check,
    otb: data.game.id === 'offline_otb',
    coordinates: settings.game.coords(),
    otbMode: settings.otb.flipPieces() ? 'flip' : 'facing',
    symmetricCoordinates: data.game.id === 'offline_otb',
    autoCastle: data.game.variant.key === 'standard',
    highlight: {
      lastMove: settings.game.highlights(),
      check: settings.game.highlights(),
      dragOver: false
    },
    movable: {
      free: false,
      color: gameApi.isPlayerPlaying(data) ? sit.player : null,
      showDests: settings.game.pieceDestinations(),
      dests: sit.dests
    },
    animation: {
      enabled: settings.game.animations(),
      duration: 300
    },
    premovable: {
      enabled: false
    },
    draggable: {
      centerPiece: data.pref.centerPiece,
      distance: 3,
      squareTarget: true,
      magnified: settings.game.magnified()
    }
  }
}

function make(
  data: OfflineGameData,
  sit: GameSituation,
  userMove: (orig: Pos, dest: Pos, meta: AfterMoveMeta) => void,
  userNewPiece: (role: Role, key: Pos, meta: AfterMoveMeta) => void,
  onMove: (orig: Pos, dest: Pos, capturedPiece: Piece) => void,
  onNewPiece: () => void
) {
  const config = makeConfig(data, sit)
  config.movable.events = {
    after: userMove,
    afterNewPiece: userNewPiece
  }
  config.events = {
    move: onMove,
    dropNewPiece: onNewPiece
  }
  return new chessground.controller(config)
}

function reload(ground: Chessground.Controller, data: OfflineGameData, sit: GameSituation) {
  ground.reconfigure(makeConfig(data, sit))
}

function changeOTBMode(ground: Chessground.Controller, flip: boolean) {
  ground.reconfigure({ otbMode: flip ? 'flip' : 'facing' })
}

function promote(ground: Chessground.Controller, key: Pos, role: Role) {
  const pieces: {[k: string]: Piece } = {}
  const piece = ground.data.pieces[key]
  if (piece && piece.role === 'pawn') {
    pieces[key] = {
      color: piece.color,
      role: role
    }
    ground.setPieces(pieces)
  }
}

function end(ground: Chessground.Controller) {
  ground.stop()
}

export default {
  make,
  reload,
  promote,
  end,
  changeOTBMode
}
