import Chessground from '../../../chessground/Chessground'
import * as cg from '../../../chessground/interfaces'
import { key2pos, pos2key } from '../../../chessground/util'

function capture(chessgroundCtrl: Chessground, key: Key) {
  const exploding: Key[] = []
  const diff: cg.PiecesDiff = {}
  const orig = key2pos(key)
  for (let x = -1; x < 2; x++) {
    for (let y = -1; y < 2; y++) {
      const k = pos2key([orig[0] + x, orig[1] + y] as cg.Pos)
      if (k) {
        exploding.push(k)
        const explodes = chessgroundCtrl.state.pieces[k] && (
          k === key || chessgroundCtrl.state.pieces[k].role !== 'pawn')
        if (explodes) diff[k] = null
      }
    }
  }
  chessgroundCtrl.setPieces(diff)
  chessgroundCtrl.explode(exploding)
}

// needs to explicitly destroy the capturing pawn
function enpassant(chessgroundCtrl: Chessground, key: Key, color: Color) {
  const pos = key2pos(key)
  const pawnPos = [pos[0], pos[1] + (color === 'white' ? -1 : 1)] as cg.Pos
  capture(chessgroundCtrl, pos2key(pawnPos))
}

export default {
  capture,
  enpassant
}
