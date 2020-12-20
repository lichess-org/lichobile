import OnlineRound from './OnlineRound'

/* Tracks moves that were played on the board,
 * sent to the server, possibly acked,
 * but without a move response from the server yet.
 * After a delay, it will trigger a reload.
 * This might fix bugs where the board is in a
 * transient, dirty state, where clocks don't tick,
 * eventually causing the player to flag.
 * It will also help with lila-ws restarts.
 */
export default class TransientMove {

  private current?: number

  constructor(readonly ctrl: OnlineRound) { }

  register = () => {
    this.current = setTimeout(this.expire, 10000)
  }

  clear = () => {
    clearTimeout(this.current)
  }

  expire = () => {
    this.ctrl.reloadGameData()
  }
}
