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
  let analysisDuration;

  window.Stockfish.init();

  const bestmoveRegExp = /^bestmove (\w{4})/;

  window.Stockfish.output(function(msg) {
    const data = msg.data;
    const bestmoveRegExpMatch = data.match(bestmoveRegExp);
    if (bestmoveRegExpMatch) {
      ctrl.onEngineSearch(bestmoveRegExpMatch[1]);
    }
  });

  return {
    search(fen) {
      window.Stockfish.cmd(`position fen ${fen}`);
      window.Stockfish.cmd(`go movetime ${analysisDuration}`);
    },

    setLevel(level) {
      analysisDuration = levels[level][0];
    },

    terminate() {
      window.Stockfish.terminate();
    }
  };
}
