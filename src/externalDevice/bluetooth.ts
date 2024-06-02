import { BleClient, BleDevice, textToDataView, dataViewToText } from '@capacitor-community/bluetooth-le'
import settings from '../settings'
import redraw from '../utils/redraw'
import i18n from '../i18n'
import { State, makeDefaults } from '../chessground/state'
import { Toast } from '@capacitor/toast'
import { BleChessProtocol } from './BleChessProtocol'
import { dummyProtocol } from './DummyProtocol'

interface ChessServiceUUIDs {
  readonly srv: string
  readonly txCh: string
  readonly rxCh: string
}
interface ChessService {
  readonly uuids: ChessServiceUUIDs
  protocol: any
}

const SUPPOTRED_SERVICES: ChessService[] = [
  { uuids: { srv:  'f5351050-b2c9-11ec-a0c0-b3bc53b08d33',
             txCh: 'f53513ca-b2c9-11ec-a0c1-639b8957db99',
             rxCh: 'f535147e-b2c9-11ec-a0c2-8bbd706ec4e6' },
    protocol: BleChessProtocol }
]

class BluetoothConnection {
  isConnected: boolean = false
  protocol: any = dummyProtocol
  centralState: State = makeDefaults()
  private uuids?: ChessServiceUUIDs

  private getDeviceId(): string {
    return settings.general.bluetooth.deviceId()!
  }

  private async onDisconnect(_deviceId: string) {
    if (!this.isConnected)
      return
    this.isConnected = false
    this.protocol = dummyProtocol
    Toast.show({ text: i18n('disconnectedFromBluetoothDevice') })
    if (settings.general.bluetooth.useDevice())
      this.connect()
  }

  async requestDevice(): Promise<BleDevice> {
    return await BleClient.requestDevice({
      services: SUPPOTRED_SERVICES.map(value => value.uuids.srv)
    })
  }

  private async setupService() {
    const connectedServices = await BleClient.getServices(this.getDeviceId())
    for (const supportedService of SUPPOTRED_SERVICES)
      if (connectedServices.some(connectedService => supportedService.uuids.srv === connectedService.uuid)) {
          this.uuids = supportedService.uuids
          this.protocol = new supportedService.protocol
          return
      }
  }

  async connect() {
    await BleClient.connect(this.getDeviceId(), deviceId => this.onDisconnect(deviceId))
    await this.setupService()
    await this.registerCallback()
    this.protocol.init(this.centralState)
    this.isConnected = true
    Toast.show({ text: i18n('connectedToBluetoothDevice') })
  }

  async disconnect() {
    if (!this.isConnected)
      return
    await this.unregisterCallback()
    await BleClient.disconnect(this.getDeviceId())
  }

  async sendCommandToPeripheral(cmd: string) {
    await BleClient.write(this.getDeviceId(), this.uuids!.srv, this.uuids!.txCh, textToDataView(cmd))
  }

  private async reciveData(data: DataView) {
    this.protocol.onPeripheralCommand(dataViewToText(data))
  }

  private async registerCallback() {
    await BleClient.startNotifications(this.getDeviceId(), this.uuids!.srv, this.uuids!.rxCh, (data) => this.reciveData(data))
  }

  private async unregisterCallback() {
    await BleClient.stopNotifications(this.getDeviceId(), this.uuids!.srv, this.uuids!.rxCh)
  }
}

const bluetoothConnection = new BluetoothConnection

export default {
  protocol() {
    return bluetoothConnection.protocol
  },
  saveCentralState(st: State) {
    bluetoothConnection.centralState = st
  },
  sendCommandToPeripheral(cmd: string) {
    bluetoothConnection.sendCommandToPeripheral(cmd)
  },
  init() {
    if (settings.general.bluetooth.useDevice()) {
      BleClient.initialize({ androidNeverForLocation: true })
      bluetoothConnection.connect()
    }
  },
  onSettingChange(useBluetooth: boolean) {
    if (useBluetooth) {
      BleClient.initialize({ androidNeverForLocation: true })
      bluetoothConnection.requestDevice()
      .then((device) => {
        settings.general.bluetooth.deviceId(device.deviceId)
        bluetoothConnection.connect()
      })
      .catch(() => {
        settings.general.bluetooth.useDevice(false)
        redraw()
      })
    }
    else {
      bluetoothConnection.disconnect()
    }
  }
}
