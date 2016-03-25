const levels = {
  1: [20, 1],
  2: [40, 2],
  3: [70, 3],
  4: [120, 4],
  5: [300, 6],
  6: [600, 8],
  7: [1000, 12],
  8: [2000, 20]
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
