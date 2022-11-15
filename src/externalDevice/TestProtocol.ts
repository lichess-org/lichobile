import { lastMoveToUci, sendMsgToDevice, sendMoveToBoard } from './utils'
import { State } from '../chessground/state'

export class TestProtocol {

  init() {}
  onReceiveMsgFromDevice(msg: string) {
    sendMoveToBoard(msg)
  }

  onBoardConfigured(st: State) {
    if (st.lastMove)
      sendMsgToDevice(lastMoveToUci(st))
  }

  onBoardStateChanged(st: State) {
    sendMsgToDevice(lastMoveToUci(st))
  }

  onMoveRejectedFromBoard() {
    sendMsgToDevice('0000')
  }
}
