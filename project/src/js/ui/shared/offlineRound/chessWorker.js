import { Chess } from 'chess.js';

module.exports = function(self) {
  function forsyth(role) {
    return role === 'knight' ? 'n' : role[0];
  }

  self.onmessage = function (ev) {
    const { ply, fen, promotion, orig, dest } = ev.data;
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
      fen: chess.fen(),
      turnColor: turnColor,
      movable: {
        color: turnColor,
        dests: chess.dests()
      },
      check: chess.in_check(),
      finished: chess.game_over(),
      checkmate: chess.in_checkmate(),
      stalemate: chess.in_stalemate(),
      threefold: chess.in_threefold_repetition(),
      draw: chess.in_draw(),
      lastMove: [move.from, move.to],
      san: move.san,
      ply: ply,
      promotion: promotionLetter
    });
  };
};
