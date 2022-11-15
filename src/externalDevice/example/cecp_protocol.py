import typing

import chess

import async_input

from protocol import BaseProtocol


SERVICE_UUID = 'f5351050-b2c9-11ec-a0c0-b3bc53b08d33'
TX_UUID = 'f53513ca-b2c9-11ec-a0c1-639b8957db99'
RX_UUID = 'f535147e-b2c9-11ec-a0c2-8bbd706ec4e6'


class Cecp(BaseProtocol):

    def __init__(self, send_callback: typing.Callable):
        super().__init__(send_callback)
        self.board = None
        self.force = True
        self.last_move = None

    def on_cmd(self, cmd: str):
        if cmd.startswith('protover'):
            self.send('feature setboard=1')
        elif cmd.startswith('new'):
            self.force = False
            self.board = chess.Board()
            self.last_move = None
        elif cmd.startswith('setboard'):
            fen = self.__get_cmd_params(cmd)
            self.board = chess.Board(fen)
            self.last_move = None
        elif cmd.startswith('go'):
            self.force = False
            self.__apply_last_move_if_exist()
            self.__print_state()
            self.__ask_user_to_move()
        elif cmd.startswith('force'):
            self.force = True
            async_input.cancel()
        elif cmd.startswith('Illegal move'):
            print('Illegal move')
            self.last_move = None
            self.__ask_user_to_move()
        elif self.__is_valid_move(cmd):
            self.__apply_last_move_if_exist()
            self.board.push(chess.Move.from_uci(cmd))
            if not self.force:
                self.__print_state()
                self.__ask_user_to_move()

    def __on_text_provided(self, text: str):
        if text.startswith('telluser'):
            self.send(text)
            async_input.ainput('', self.__on_text_provided)
        else:
            self.last_move = text
            self.send(f'move {text}')

    def __apply_last_move_if_exist(self):
        if self.last_move is not None:
            self.board.push(chess.Move.from_uci(self.last_move))
            self.last_move = None

    def __print_state(self):
        print(self.board)
        print(f'Turn: {self._color_to_str(self.board.turn)}')

    def __ask_user_to_move(self):
        async_input.ainput('Provide move:\n', self.__on_text_provided)

    @staticmethod
    def __get_cmd_params(cmd: str):
        return cmd.split(' ', 1)[1]

    @staticmethod
    def __is_valid_move(move: str):
        try:
            chess.Move.from_uci(move)
            return True
        except ValueError:
            return False
