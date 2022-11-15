import chess

import async_input

from protocol import BaseProtocol


SERVICE_UUID = 'f535151e-b2c9-11ec-a0c3-1f8edc817d5a'
TX_UUID = 'f53515fa-b2c9-11ec-a0c4-5fae981f8945'
RX_UUID = 'f53516fe-b2c9-11ec-a0c5-a792c62e5941'


class Uci(BaseProtocol):

    def on_cmd(self, cmd: str):
        if cmd == 'uci':
            self.send('id name uci_console')
            self.send('id author lichobile')
            self.send('uciok')
        elif cmd == 'isready':
            self.send('readyok')
        elif cmd.startswith('position'):
            self.__handle_position(cmd)
        elif cmd.startswith('go'):
            async_input.ainput('Provide move:\n', self.__send_move)
        elif cmd == 'stop':
            async_input.cancel()
            self.__send_move(str(chess.Move.null()))

    def __handle_position(self, cmd: str):
        pos, moves = cmd.split(' moves ') if 'moves' in cmd else cmd, ''
        if 'fen' in pos:
            fen = pos.split(' fen ').pop()
            board = chess.Board(fen)
        else:
            board = chess.Board()

        for move in moves.split():
            board.push_uci(move)

        print(board)
        print(f'Turn: {self._color_to_str(board.turn)}')

    def __send_move(self, move: str):
        self.send(f'bestmove {move}')
