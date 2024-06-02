export class DummyProtocol {
  init() {}
  onPeripheralCommand() {}
  onCentralStateCreated() {}
  onCentralStateChanged() {}
  onMoveRejectedByCentral() {}
}
export const dummyProtocol = new DummyProtocol