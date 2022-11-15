import { BleClient, BleDevice, textToDataView, dataViewToText } from '@capacitor-community/bluetooth-le'
import settings from '../settings'
import redraw from '../utils/redraw'
import i18n from '../i18n'
import { Toast } from '@capacitor/toast'
import { delay } from './utils'
import { TestProtocol } from './TestProtocol'
import { UciProtocol } from './UciProtocol'
import { CecpProtocol } from './CecpProtocol'
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
    protocol: CecpProtocol },
  { uuids: { srv:  'f535151e-b2c9-11ec-a0c3-1f8edc817d5a',
             txCh: 'f53515fa-b2c9-11ec-a0c4-5fae981f8945',
             rxCh: 'f53516fe-b2c9-11ec-a0c5-a792c62e5941' },
    protocol: UciProtocol },
  { uuids: { srv:  'f53517f8-b2c9-11ec-a0c6-0b0444f1fbcf',
             txCh: 'f53518e8-b2c9-11ec-a0c7-37a4d530b37c',
             rxCh: 'f53519ce-b2c9-11ec-a0c8-bf55a9cd833d' },
    protocol: TestProtocol }
]

class BluetoothConnection {
  isConnected: boolean = false
  protocol: any = dummyProtocol
  private uuids?: ChessServiceUUIDs

  private getDeviceId(): string {
    return settings.general.bluetooth.deviceId()!
  }

  private async onDisconnect(_deviceId: string) {
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
    this.protocol.init()
    this.isConnected = true
    Toast.show({ text: i18n('connectedToBluetoothDevice') })
  }

  async disconnect() {
    if (!this.isConnected)
      return
    await this.unregisterCallback()
    await BleClient.disconnect(this.getDeviceId())
  }

  async sendMsgToDevice(msg: string) {
    await delay(20); // temporery woraround: https://github.com/capacitor-community/bluetooth-le/issues/341
    await BleClient.write(this.getDeviceId(), this.uuids!.srv, this.uuids!.txCh, textToDataView(msg))
  }

  private async reciveData(data: DataView) {
    this.protocol.onReceiveMsgFromDevice(dataViewToText(data))
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
  sendMsgToDevice(msg: string) {
    bluetoothConnection.sendMsgToDevice(msg)
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
