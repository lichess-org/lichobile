import { askWorker } from '../../utils';

export default function chessLogic(ctrl) {

  const worker = new Worker('vendor/scalachessjs.js');

  worker.addEventListener('message', function(msg) {
    const payload = msg.data.payload;

    switch (msg.data.topic) {
      case 'dests':
        ctrl.addDests(payload.dests, payload.path);
        break;
      case 'move':
        if (payload.path) {
          var sit = payload.situation;
          var step = {
            ply: sit.ply,
            dests: sit.dests,
            check: sit.check,
            fen: sit.fen,
            uci: sit.uciMoves[0],
            san: sit.pgnMoves[0]
          };
          ctrl.addStep(step, payload.path);
        }
        break;
    }
  });

  return {
    sendStepRequest(req) {
      worker.postMessage({ topic: 'move', payload: req });
    },
    sendDestsRequest(req) {
      worker.postMessage({ topic: 'dests', payload: req });
    },
    getSanMoveFromUci(req, callback) {
      askWorker(worker, { topic: 'move', payload: req }, callback);
    },
    onunload() {
      if (worker) worker.terminate();
    }
  };
}
