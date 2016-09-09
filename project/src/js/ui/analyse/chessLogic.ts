import { askWorker } from '../../utils';

export interface ChessMove {
  situation: GameSituation
  path: string
}

export interface ChesslogicInterface {
  sendMoveRequest(req: any): void
  sendDropRequest(req: any): void
  sendDestsRequest(req: any): void
  getSanMoveFromUci(req: any): Promise<ChessMove>
  importPgn(pgn: string): Promise<{ pgn: string }>
  exportPgn(variant: string, initialFen: string, pgnMoves: Array<string>): Promise<{ pgn: string }>
  terminate(): void
}

export default function chessLogic(ctrl): ChesslogicInterface {

  const worker = new Worker('vendor/scalachessjs.js');

  worker.addEventListener('message', function(msg) {
    const payload = msg.data.payload;

    switch (msg.data.topic) {
      case 'dests':
        ctrl.addDests(payload.dests, payload.path);
        break;
      case 'move':
      case 'drop':
        if (payload.path) {
          const sit = payload.situation;
          const step = {
            ply: sit.ply,
            dests: sit.dests,
            drops: sit.drops,
            check: sit.check,
            checkCount: sit.checkCount,
            fen: sit.fen,
            uci: sit.uciMoves[0],
            san: sit.pgnMoves[0],
            crazy: sit.crazyhouse
          };
          ctrl.addStep(step, payload.path);
        }
        break;
    }
  });

  return {
    sendMoveRequest(req) {
      worker.postMessage({ topic: 'move', payload: req });
    },
    sendDropRequest(req) {
      worker.postMessage({ topic: 'drop', payload: req });
    },
    sendDestsRequest(req) {
      worker.postMessage({ topic: 'dests', payload: req });
    },
    getSanMoveFromUci(req) {
      return askWorker(worker, { topic: 'move', payload: req });
    },
    importPgn(pgn) {
      return askWorker(worker, { topic: 'pgnRead', payload: { pgn }});
    },
    exportPgn(variant, initialFen, pgnMoves) {
      return askWorker(worker, {
        topic: 'pgnDump',
        payload: {
          variant,
          initialFen,
          pgnMoves
        }
      });
    },
    terminate() {
      if (worker) worker.terminate();
    }
  };
}
