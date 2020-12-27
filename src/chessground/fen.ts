import * as cg from './interfaces'
import * as util from './util'

const initial = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'

const roles: {[i: string]: Role} = {
  p: 'pawn',
  r: 'rook',
  n: 'knight',
  b: 'bishop',
  q: 'queen',
  k: 'king',
  P: 'pawn',
  R: 'rook',
  N: 'knight',
  B: 'bishop',
  Q: 'queen',
  K: 'king'
}

const letters = {
  pawn: 'p',
  rook: 'r',
  knight: 'n',
  bishop: 'b',
  queen: 'q',
  king: 'k'
}

export function read(fen: string): cg.Pieces {
  if (fen === 'start') fen = initial
  const pieces: cg.Pieces = new Map()
  let row = 8
  let col = 0
  for (let i = 0; i < fen.length; i++) {
    const c = fen[i]
    switch (c) {
      case ' ': return pieces
      case '/':
        --row
        if (row === 0) return pieces
        col = 0
        break
      case '~': {
        const k = util.pos2key([col, row] as cg.Pos)
        const p = pieces.get(k)
        if (p) {
          p.promoted = true
          pieces.set(k, p)
        }
        break
      }
      default: {
        const nb = ~~c
        if (nb) col += nb
        else {
          ++col
          const role = c.toLowerCase()
          pieces.set(util.pos2key([col, row] as cg.Pos), {
            role: roles[role],
            color: (c === role ? 'black' : 'white') as Color
          })
        }
      }
    }
  }
  return pieces
}

function write(pieces: cg.Pieces) {
  return [8, 7, 6, 5, 4, 3, 2].reduce(
    function(str, nb) {
      return str.replace(new RegExp(Array(nb + 1).join('1'), 'g'), String(nb))
    },
    util.invRanks.map((y) => {
      return util.ranks.map((x) => {
        const piece = pieces.get(util.pos2key([x, y]))
        if (piece) {
          const letter = letters[piece.role]
          return piece.color === 'white' ? letter.toUpperCase() : letter
        } else return '1'
      }).join('')
    }).join('/'))
}

export default {
  initial,
  read,
  write
}
