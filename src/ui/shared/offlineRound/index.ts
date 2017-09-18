import { OfflineRoundInterface } from '../round/index'
import { GameStatus } from '../../../lichess/interfaces/game'

export function setResult(ctrl: OfflineRoundInterface, status?: GameStatus, winner?: Color) {
  const sit = ctrl.replay.situation()
  if (status) {
    ctrl.data.game.status = status
  } else {
    ctrl.data.game.status = { id: 20, name: 'started' }
  }
  ctrl.data.game.winner = winner || sit.winner
}
