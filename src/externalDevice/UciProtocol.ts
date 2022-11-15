import { BaseProtocol, BaseState } from './BaseProtocol'
import { isUserTurn, genFullFen, getCommandParams, sendMsgToDevice, sendMoveToBoard } from './utils'
import { State } from '../chessground/state'

export class UciProtocol extends BaseProtocol {
  init() {
    this.transitionTo(new Init)
  }
}

abstract class UciState extends BaseState {
  startNewGame() {
    sendMsgToDevice('ucinewgame')
    sendMsgToDevice('isready')
  }

  askDeviceToMove(st: State) {
    sendMsgToDevice('position fen ' + genFullFen(st))
    sendMsgToDevice('go infinite')
  }
}

class Init extends UciState {
  onEnter() {
    sendMsgToDevice('uci')
  }

  onReceiveMsgFromDevice(msg: string) {
    if (msg === 'uciok')
      sendMsgToDevice('isready')
    else if (msg === 'readyok')
      this.transitionTo(new WaitApiMove)
  }
}

class WaitApiMove extends UciState {
  onBoardConfigured(st: State) {
    this.startNewGame()
    this.onBoardStateChanged(st)
  }

  onBoardStateChanged(st: State) {
    if (isUserTurn(st)) {
      this.transitionTo(new WaitUserMove)
      this.askDeviceToMove(st)
    }
  }
}

class WaitUserMove extends UciState {
  onReceiveMsgFromDevice(msg: string) {
    if (msg.startsWith('bestmove')) {
      this.transitionTo(new VerifyUserMove)
      sendMoveToBoard(getCommandParams(msg))
    }
  }

  onBoardConfigured(st: State) {
    sendMsgToDevice('stop')
    this.startNewGame()
    this.evaluateTurn(st)
  }

  onBoardStateChanged(st: State) {
    sendMsgToDevice('stop')
    this.evaluateTurn(st)
  }

  private evaluateTurn(st: State) {
    if (isUserTurn(st)) {
      this.transitionTo(new WaitTerminationAndUserMove)
      this.askDeviceToMove(st)
    }
    else
      this.transitionTo(new WaitTerminationAndApiMove)
  }
}

class VerifyUserMove extends UciState {
  onBoardConfigured(st: State) {
    this.startNewGame()
    this.evaluateTurn(st)
  }

  onBoardStateChanged(st: State) {
    this.evaluateTurn(st)
  }

  onMoveRejectedFromBoard(st: State) {
    this.transitionTo(new WaitUserMove)
    this.askDeviceToMove(st)
  }

  private evaluateTurn(st: State) {
    if (isUserTurn(st)) {
      this.transitionTo(new WaitUserMove)
      this.askDeviceToMove(st)
    }
    else
      this.transitionTo(new WaitApiMove)
  }
}

class WaitTerminationAndUserMove extends UciState {
  onReceiveMsgFromDevice(msg: string) {
    if (msg.startsWith('bestmove'))
      this.transitionTo(new WaitUserMove)
  }
}

class WaitTerminationAndApiMove extends UciState {
  onReceiveMsgFromDevice(msg: string) {
    if (msg.startsWith('bestmove'))
      this.transitionTo(new WaitApiMove)
  }

  onBoardConfigured(st: State) {
    this.startNewGame()
    if (isUserTurn(st))
      this.onBoardStateChanged(st)
  }

  onBoardStateChanged(st: State) {
    this.transitionTo(new WaitTerminationAndUserMove)
    this.askDeviceToMove(st)
  }
}