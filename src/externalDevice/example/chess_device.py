import logging

from bluezero import device

from protocol import Protocol


class ChessDevice:

    def __init__(self, protocol: Protocol = None):
        self._characteristic = None
        self.set_protocol(protocol)

    def set_protocol(self, protocol: Protocol):
        self._protocol = protocol

    def send(self, text):
        if self._characteristic:
            logging.debug(f'Send: {text}')
            self._characteristic.set_value(text.encode('utf-8'))

    @staticmethod
    def on_connect(ble_device: device.Device):
        logging.info(f"Connected to {ble_device.address}")

    def on_disconnect(self, adapter_address, device_address):
        logging.info(f"Disconnected from {device_address}")
        self._protocol.stop()

    def on_change_notify(self, notifying, characteristic):
        logging.info(f'Notifications enable: {notifying}')
        self._characteristic = characteristic
        if notifying:
            self._protocol.start()

    def on_data_recived(self, value, options):
        cmd = bytes(value).decode('utf-8')
        logging.debug(f'Recieved: {cmd}')
        self._protocol.on_cmd(cmd)
