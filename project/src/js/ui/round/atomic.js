import { util } from 'chessground-mobile';

function capture(ctrl, key) {
  const exploding = [];
  const diff = {};
  const orig = util.key2pos(key);
  for (let x = -1; x < 2; x++) {
    for (let y = -1; y < 2; y++) {
      const k = util.pos2key([orig[0] + x, orig[1] + y]);
      if (k) {
        exploding.push(k);
        const explodes = ctrl.chessground.data.pieces[k] && (
          k === key || ctrl.chessground.data.pieces[k].role !== 'pawn');
        if (explodes) diff[k] = null;
      }
    }
  }
  ctrl.chessground.setPieces(diff);
  ctrl.chessground.explode(exploding);
}

// needs to explicitly destroy the capturing pawn
function enpassant(ctrl, key, color) {
  const pos = util.key2pos(key);
  const pawnPos = [pos[0], pos[1] + (color === 'white' ? -1 : 1)];
  capture(ctrl, util.pos2key(pawnPos));
}

export default {
  capture,
  enpassant
};
