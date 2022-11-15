export class DummyProtocol {
  init() {}
  onReceiveMsgFromDevice() {}
  onBoardConfigured() {}
  onBoardStateChanged() {}
  onMoveRejectedFromBoard() {}
}
export const dummyProtocol = new DummyProtocol