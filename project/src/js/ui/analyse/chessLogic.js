import { hasNetwork } from '../../utils';
import analyseSocket from './analyseSocket';
import work from 'webworkify';
import chessWorker from './chessWorker';

export default function chessLogic(ctrl) {

  let socket, worker;

  if (hasNetwork()) {
    socket = new analyseSocket(ctrl);
  } else {
    worker = work(chessWorker);
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
  }

  return {
    sendMoveRequest(req) {
      if (hasNetwork()) socket.sendAnaMove(req);
      else worker.postMessage({ topic: 'move', payload: req });
    },
    sendDestsRequest(req) {
      if (hasNetwork()) socket.sendAnaDests(req);
      else worker.postMessage({ topic: 'dests', payload: req });
    }
  };
}
