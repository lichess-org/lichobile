import threading
import asyncio
import aioconsole

from singleton import singleton


@singleton
class AsyncInput:

    def __init__(self):
        self._on_input_callback = None
        self._loop = asyncio.new_event_loop()
        self._task = None
        self._thread = threading.Thread(target=self._start_background_loop, daemon=True)
        self._thread.start()

    def start(self, promt, callback):
        self._on_input_callback = callback
        self._task = asyncio.run_coroutine_threadsafe(aioconsole.ainput(promt), self._loop)
        self._task.add_done_callback(self._callback_wrap)

    def cancel(self):
        if self._task:
            self._task.cancel()

    def is_collecting(self):
        return self._task is not None and not self._task.done()

    def _callback_wrap(self, future):
        if not future.cancelled():
            self._on_input_callback(future.result())

    def _start_background_loop(self):
        asyncio.set_event_loop(self._loop)
        self._loop.run_forever()


def ainput(promt: str, callback):
    ai = AsyncInput()
    if ai.is_collecting():
        ai.cancel()
    ai.start(promt, callback)


def cancel():
    AsyncInput().cancel()
