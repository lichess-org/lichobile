import async_input

from protocol import BaseProtocol


SERVICE_UUID = 'f53517f8-b2c9-11ec-a0c6-0b0444f1fbcf'
TX_UUID = 'f53518e8-b2c9-11ec-a0c7-37a4d530b37c'
RX_UUID = 'f53519ce-b2c9-11ec-a0c8-bf55a9cd833d'


class TestProtocol(BaseProtocol):

    def start(self):
        async_input.ainput('Wait move:\n', self.send)

    def on_cmd(self, text):
        print(f'Move recived: {text}')
        async_input.cancel()
        async_input.ainput('Wait move:\n', self.send)
