import argparse
import logging

from bluezero import adapter
from bluezero import peripheral

import uci_protocol
import cecp_protocol
import test_protocol
import chess_device


def main():
    logging.basicConfig(format='%(message)s', level=logging.INFO)

    parser = argparse.ArgumentParser(description='Run chess device')
    parser.add_argument("--protocol", choices=['test', 'uci', 'cecp'], default="test",
                        help="protocol for chess device")

    args = parser.parse_args()

    device = chess_device.ChessDevice()
    if args.protocol == "test":
        protocol = test_protocol.TestProtocol(device.send)
        service_uuid = test_protocol.SERVICE_UUID
        tx_uuid = test_protocol.TX_UUID
        rx_uuid = test_protocol.RX_UUID
    elif args.protocol == "uci":
        protocol = uci_protocol.Uci(device.send)
        service_uuid = uci_protocol.SERVICE_UUID
        tx_uuid = uci_protocol.TX_UUID
        rx_uuid = uci_protocol.RX_UUID
    elif args.protocol == "cecp":
        protocol = cecp_protocol.Cecp(device.send)
        service_uuid = cecp_protocol.SERVICE_UUID
        tx_uuid = cecp_protocol.TX_UUID
        rx_uuid = cecp_protocol.RX_UUID

    device.set_protocol(protocol)
    chess_peripheral = peripheral.Peripheral(__get_adapter_adress(),
                                             local_name='Chess board')
    chess_peripheral.add_service(srv_id=1, uuid=service_uuid, primary=True)
    chess_peripheral.add_characteristic(
        srv_id=1, chr_id=1, uuid=tx_uuid,
        value=[], notifying=False,
        flags=['write'],
        write_callback=device.on_data_recived)
    chess_peripheral.add_characteristic(
        srv_id=1, chr_id=2, uuid=rx_uuid,
        value=[], notifying=False,
        flags=['read', 'notify'],
        notify_callback=device.on_change_notify)

    chess_peripheral.on_connect = device.on_connect
    chess_peripheral.on_disconnect = device.on_disconnect

    chess_peripheral.publish()


def __get_adapter_adress():
    return list(adapter.Adapter.available())[0].address


if __name__ == "__main__":
    main()
