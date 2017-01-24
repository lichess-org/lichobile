import chessground from '../../../chessground';

function capture(chessgroundCtrl, key) {
  const exploding = [];
  const diff = {};
  const orig = chessground.util.key2pos(key);
  for (let x = -1; x < 2; x++) {
    for (let y = -1; y < 2; y++) {
      const k = chessground.util.pos2key([orig[0] + x, orig[1] + y]);
      if (k) {
        exploding.push(k);
        const explodes = chessgroundCtrl.data.pieces[k] && (
          k === key || chessgroundCtrl.data.pieces[k].role !== 'pawn');
        if (explodes) diff[k] = null;
      }
    }
  }
  chessgroundCtrl.setPieces(diff);
  chessgroundCtrl.explode(exploding);
}

// needs to explicitly destroy the capturing pawn
function enpassant(chessgroundCtrl, key, color) {
  const pos = chessground.util.key2pos(key);
  const pawnPos = [pos[0], pos[1] + (color === 'white' ? -1 : 1)];
  capture(chessgroundCtrl, chessground.util.pos2key(pawnPos));
}

export default {
  capture,
  enpassant
};
