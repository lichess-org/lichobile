import { State } from './chessground/state'
import bluetooth from './externalDevice/bluetooth'

type MoveCallback = (orig: Key, dest: Key, prom?: Role) => void
let callback: MoveCallback | undefined

export default {
  onBoardConfigured(st: State) {
    bluetooth.protocol().onBoardConfigured(st)
  },
  onBoardStateChanged(st: State) {
    bluetooth.protocol().onBoardStateChanged(st)
  },
  onMoveRejectedFromBoard(st: State) {
    bluetooth.protocol().onMoveRejectedFromBoard(st)
  },
  sendMoveToBoard(orig: Key, dest: Key, prom?: Role) {
    if (callback)
      callback(orig, dest, prom)
  },
  subscribeToDeviceMoves(moveCallback: MoveCallback) {
    callback = moveCallback
  },
  unsubscribeFromDeviceMoves() {
    callback = undefined
  }
}
