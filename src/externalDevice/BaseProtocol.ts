import { State } from '../chessground/state'

export class BaseProtocol {
  private state?: BaseState

  transitionTo(state: BaseState) {
    this.state = state
    this.state.setContext(this)
    this.state.onEnter()
  }

  onReceiveMsgFromDevice(msg: string) {
    this.state?.onReceiveMsgFromDevice(msg)
  }
  onBoardConfigured(st: State) {
    this.state?.onBoardConfigured(st)
  }
  onBoardStateChanged(st: State) {
    this.state?.onBoardStateChanged(st)
  }
  onMoveRejectedFromBoard(st: State) {
    this.state?.onMoveRejectedFromBoard(st)
  }
}
const dummyBaseProtocol = new BaseProtocol

export class BaseState {
  protected context: any = dummyBaseProtocol

  setContext(context: BaseProtocol) {
    this.context = context
  }
  transitionTo(state: BaseState) {
    this.context.transitionTo(state)
  }

  onEnter() {}
  onReceiveMsgFromDevice(_msg: string) {}
  onBoardConfigured(_st: State) {}
  onBoardStateChanged(_st: State) {}
  onMoveRejectedFromBoard(_st: State) {}
}