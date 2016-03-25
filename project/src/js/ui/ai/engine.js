const levels = {
  1: [20, 1],
  2: [50, 2],
  3: [100, 3],
  4: [200, 4],
  5: [300, 6],
  6: [800, 8],
  7: [2000, 12],
  8: [4000, 20]
};

export default function(ctrl) {
  const worker = new Worker('vendor/stockfish6.js');

  let analysisDuration;

  const bestmoveRegExp = /^bestmove (\w{4})/;
  worker.addEventListener('message', function(msg) {
    const data = msg.data;
    const bestmoveRegExpMatch = data.match(bestmoveRegExp);
    if (bestmoveRegExpMatch) {
      ctrl.onEngineSearch(bestmoveRegExpMatch[1]);
    }
  });

  return {
    search: function(fen) {
      worker.postMessage(`position fen ${fen}`);
      worker.postMessage(`go movetime ${analysisDuration}`);
    },

    setLevel: function(level) {
      analysisDuration = levels[level][0];
    },

    terminate() {
      worker.terminate();
    }
  };
}
