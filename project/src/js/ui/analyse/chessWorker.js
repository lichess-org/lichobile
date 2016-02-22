import { Chess } from 'chess.js';

export default function chessWorker(self) {
  function forsyth(role) {
    return role === 'knight' ? 'n' : role[0];
  }

  self.onmessage = function (msg) {
    switch (msg.data.topic) {
      case 'getDests':
        getDests(msg.data.payload);
        break;
      case 'addMove':
        addMove(msg.data.payload);
        break;
    }
  };

  function getDests(data) {
    const { fen, path } = data;
    const chess = new Chess(fen, 0);
    self.postMessage({
      topic: 'dests',
      payload: {
        dests: chess.dests(),
        path
      }
    });
  }

  function addMove(data) {
    console.log(data);
    const { fen, promotion, orig, dest, path } = data;
    const promotionLetter = (dest[1] === '1' || dest[1] === '8') ?
    (promotion ? forsyth(promotion) : 'q') : null;
    const chess = new Chess(fen, 0);
    const move = chess.move({
      from: orig,
      to: dest,
      promotion: promotionLetter
    });
    const turnColor = chess.turn() === 'w' ? 'white' : 'black';
    self.postMessage({
      topic: 'step',
      payload: {
        fen: chess.fen(),
        turnColor: turnColor,
        dests: chess.dests(),
        check: chess.in_check(),
        finished: chess.game_over(),
        checkmate: chess.in_checkmate(),
        stalemate: chess.in_stalemate(),
        threefold: chess.in_threefold_repetition(),
        draw: chess.in_draw(),
        lastMove: [move.from, move.to],
        san: move.san,
        promotion: promotionLetter,
        path
      }
    });
  }
}
