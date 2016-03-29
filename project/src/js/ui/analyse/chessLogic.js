import { askWorker } from '../../utils';

export default function chessLogic(ctrl) {

  const worker = new Worker('lib/chessWorker.js');

  worker.addEventListener('message', function(msg) {
    switch (msg.data.topic) {
      case 'dests':
        ctrl.addDests(msg.data.payload.dests, msg.data.payload.path);
        break;
      case 'step':
        ctrl.addStep(msg.data.payload.step, msg.data.payload.path);
        break;
    }
  });

  return {
    sendStepRequest(req) {
      worker.postMessage({ topic: 'step', payload: req });
    },
    sendDestsRequest(req) {
      worker.postMessage({ topic: 'dests', payload: req });
    },
    getSanMoveFromUci(req, callback) {
      askWorker(worker, { topic: 'san', payload: req }, callback);
    },
    onunload() {
      if (worker) worker.terminate();
    }
  };
}
