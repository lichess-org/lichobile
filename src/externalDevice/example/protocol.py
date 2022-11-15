import abc
import typing

import chess

import async_input


class Protocol(abc.ABC):

    @abc.abstractmethod
    def on_cmd(self, cmd: str):
        pass

    @abc.abstractmethod
    def start(self):
        pass

    @abc.abstractmethod
    def stop(self):
        pass


class BaseProtocol(Protocol):

    def __init__(self, send_callback: typing.Callable):
        self._send_clb = send_callback

    def start(self):
        pass

    def stop(self):
        async_input.cancel()

    def send(self, cmd: str):
        self._send_clb(cmd)

    @staticmethod
    def _color_to_str(color):
        return 'white' if color == chess.WHITE else 'black'
