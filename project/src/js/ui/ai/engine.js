export default function(ctrl) {
  const worker = new Worker('vendor/stockfish6.js');

  const bestmoveRegExp = /^bestmove (\w{4})/;
  worker.addEventListener('message', function(msg) {
    const data = msg.data;
    console.log('data', data);
    const bestmoveRegExpMatch = data.match(bestmoveRegExp);
    if (bestmoveRegExpMatch) {
      ctrl.onEngineSearch(bestmoveRegExpMatch[1]);
    }
  });

  return {
    search: function(fen) {
      worker.postMessage(`position fen ${fen}`);
      worker.postMessage('go movetime 500');
    },

    terminate() {
      worker.terminate();
    }
  };
}
