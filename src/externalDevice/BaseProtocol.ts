import { State } from '../chessground/state'

export class BaseProtocol {
  private state?: BaseState

  transitionTo(state: BaseState) {
    this.state = state
    this.state.setContext(this)
    this.state.onEnter()
  }

  onPeripheralCommand(cmd: string) {
    this.state?.onPeripheralCommand(cmd)
  }
  onCentralStateCreated(st: State) {
    this.state?.onCentralStateCreated(st)
  }
  onCentralStateChanged() {
    this.state?.onCentralStateChanged()
  }
  onMoveRejectedByCentral() {
    this.state?.onMoveRejectedByCentral()
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
  onPeripheralCommand(_cmd: string) {}
  onCentralStateCreated(_st: State) {}
  onCentralStateChanged() {}
  onMoveRejectedByCentral() {}
}