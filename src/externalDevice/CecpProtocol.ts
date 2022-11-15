import { BaseProtocol, BaseState } from './BaseProtocol'
import * as chessFormat from '../utils/chessFormat'
import { isUserTurn, genFullFen, lastMoveToUci, getCommandParams, sendMsgToDevice, sendMoveToBoard } from './utils'
import { State } from '../chessground/state'
import { Toast } from '@capacitor/toast'
import i18n from '../i18n'

export class CecpProtocol extends BaseProtocol {
  lastDeviceMove: string = ''
  features = new CecpFeatures

  init() {
    this.transitionTo(new Init)
  }
}

class CecpFeatures {
  setboard: boolean = false

  setFeature(name: string, value: string): boolean {
    if (name === 'setboard') {
      this.setboard = value === '1'
      return true
    }
    return false
  }
}

abstract class CecpState extends BaseState {
  setLastDeviceMove(move: string) {
    this.context.lastDeviceMove = move
  }
  getLastDeviceMove() {
    return this.context.lastDeviceMove
  }
  getFeatures(): CecpFeatures {
    return this.context.features
  }

  onReceiveMsgFromDevice(msg: string) {
    if (msg.startsWith('telluser'))
      Toast.show({ text: getCommandParams(msg) })
  }

  onBoardConfigured(st: State) {
    this.initNewBoardOnDevice(st)
    this.transitionTo(isUserTurn(st) ? new AskAndWaitUserMove : new WaitApiMove)
  }

  sendMoveToDevice(st: State) {
    sendMsgToDevice(lastMoveToUci(st))
  }

  private initNewBoardOnDevice(st: State) {
    sendMsgToDevice('new')
    if (this.getFeatures().setboard)
      this.setBoardOnDevice(st)
    else
      this.editBoardOnDevice(st)
  }

  private setBoardOnDevice(st: State) {
    sendMsgToDevice('setboard ' + genFullFen(st))
  }

  private editBoardOnDevice(st: State) {
    if (st.turnColor === 'black') {
      sendMsgToDevice('force')
      sendMsgToDevice('a2a3')
    }
    sendMsgToDevice('edit')
    sendMsgToDevice('#')
    for (const [key, piece] of st.pieces)
      sendMsgToDevice(chessFormat.roleToUci(piece.role, piece.color) + key)
    sendMsgToDevice('.')
  }
}

class Init extends CecpState {
  onEnter() {
    sendMsgToDevice('xboard')
    sendMsgToDevice('protover 2')
  }

  onReceiveMsgFromDevice(msg: string) {
    if (msg.startsWith('feature')) {
      for (const feature of getCommandParams(msg).split(' ')) {
        const splited = feature.split('=')
        this.handleFeature(splited[0], splited[1])
      }
    }
    else super.onReceiveMsgFromDevice(msg)
  }

  private handleFeature(name: string, value: string) {
    if (this.getFeatures().setFeature(name, value))
      sendMsgToDevice('accepted ' + name)
    else
      sendMsgToDevice('rejected ' + name)
  }
}

class WaitApiMove extends CecpState {
  onBoardStateChanged(st: State) {
    this.sendMoveToDevice(st)
    this.transitionTo(new WaitUserMove)
  }
}

class ForcedWaitApiMove extends CecpState {
  onBoardStateChanged(st: State) {
    this.sendMoveToDevice(st)
    this.transitionTo(new AskAndWaitUserMove)
  }
}

class WaitUserMove extends CecpState {
  onReceiveMsgFromDevice(msg: string) {
    if (msg.startsWith('move')) {
      this.setLastDeviceMove(getCommandParams(msg))
      this.transitionTo(new VerifyUserMove)
    }
    else super.onReceiveMsgFromDevice(msg)
  }

  onBoardStateChanged(st: State) {
    sendMsgToDevice('force')
    this.sendMoveToDevice(st)
    this.transitionTo(isUserTurn(st) ? new AskAndWaitUserMove : new ForcedWaitApiMove)
  }
}

class AskAndWaitUserMove extends WaitUserMove {
  onEnter() {
    sendMsgToDevice('go')
  }
}

class VerifyUserMove extends CecpState {
  onEnter() {
    sendMoveToBoard(this.getLastDeviceMove())
  }

  onBoardStateChanged(st: State) {
    if (this.isOnScreenPromotion(st)) {
      this.sendMoveRejectedToDevice('without promotion')
      sendMsgToDevice('force')
      this.sendMoveToDevice(st)
      this.transitionTo(isUserTurn(st) ? new AskAndWaitUserMove : new ForcedWaitApiMove)
    }
    else
      this.transitionTo(isUserTurn(st) ? new AskAndWaitUserMove : new WaitApiMove)
  }

  onMoveRejectedFromBoard() {
    Toast.show({ text: `${i18n('rejected')}: ${this.getLastDeviceMove()}` })
    this.sendMoveRejectedToDevice()
    this.transitionTo(new WaitUserMove)
  }

  private isOnScreenPromotion(st: State) {
    return this.getLastDeviceMove() !== lastMoveToUci(st)
  }

  private sendMoveRejectedToDevice(reason?: string) {
    if (reason)
      sendMsgToDevice(`Illegal move (${reason}): ${this.getLastDeviceMove()}`)
    else
      sendMsgToDevice(`Illegal move: ${this.getLastDeviceMove()}`)
  }
}