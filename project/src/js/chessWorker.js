import { Chess } from 'chess.js';

export default function(self) {

  self.onmessage = function (msg) {
    switch (msg.data.topic) {
      case 'dests':
        getDests(msg.data.payload);
        break;
      case 'san':
        getSan(msg.data.payload);
        break;
      case 'move':
        getMove(msg.data.payload);
        break;
      case 'step':
        getStep(msg.data.payload);
        break;
    }
  };

  function forsyth(role) {
    return role === 'knight' ? 'n' : role[0];
  }

  function toUci(move) {
    return move.from + move.to;
  }

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

  function getSan(data) {
    const { from, to, fen } = data;
    const chess = new Chess(fen, 0);
    const move = chess.move({ from, to });
    self.postMessage({
      topic: 'san',
      payload: move.san
    });
  }

  function getStep(data) {
    const { fen, promotion, orig, dest, path, ply } = data;
    const promotionLetter = (dest[1] === '1' || dest[1] === '8') ?
    (promotion ? forsyth(promotion) : 'q') : null;
    const chess = new Chess(fen, 0);
    const move = chess.move({
      from: orig,
      to: dest,
      promotion: promotionLetter
    });
    self.postMessage({
      topic: 'step',
      payload: {
        step: {
          ply: ply + 1,
          dests: chess.dests(),
          check: chess.in_check(),
          fen: chess.fen(),
          uci: toUci(move),
          san: move.san
        },
        path
      }
    });
  }

  function getMove(data) {
    const { ply, fen, promotion, orig, dest } = data;
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
      topic: 'move',
      payload: {
        fen: chess.fen(),
        turnColor: turnColor,
        movable: {
          color: turnColor,
          dests: chess.dests()
        },
        finished: chess.game_over(),
        check: chess.in_check(),
        checkmate: chess.in_checkmate(),
        stalemate: chess.in_stalemate(),
        threefold: chess.in_threefold_repetition(),
        draw: chess.in_draw(),
        lastMove: [move.from, move.to],
        san: move.san,
        ply: ply,
        promotion: promotionLetter
      }
    });
  }
}
