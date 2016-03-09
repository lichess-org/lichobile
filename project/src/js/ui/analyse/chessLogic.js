import work from 'webworkify';
import chessWorker from './chessWorker';

export default function chessLogic(ctrl) {

  const worker = work(chessWorker);

  worker.onmessage = function(msg) {
    switch (msg.data.topic) {
      case 'dests':
        ctrl.addDests(msg.data.payload.dests, msg.data.payload.path);
        break;
      case 'step':
        ctrl.addStep(msg.data.payload.step, msg.data.payload.path);
        break;
    }
  };

  return {
    sendMoveRequest(req) {
      worker.postMessage({ topic: 'move', payload: req });
    },
    sendDestsRequest(req) {
      worker.postMessage({ topic: 'dests', payload: req });
    },
    onunload() {
      if (worker) worker.terminate();
    }
  };
}
