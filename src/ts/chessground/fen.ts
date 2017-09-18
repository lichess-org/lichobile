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

export function read(fen: string): { [k: string]: Piece } {
  if (fen === 'start') fen = initial
  const pieces: { [k: string]: Piece } = {}
  let row: number = 8
  let col: number = 0
  for (let i = 0; i < fen.length; i++) {
    const c = fen[i]
    switch (c) {
      case ' ': return pieces
      case '/':
        --row
        if (row === 0) return pieces
        col = 0
        break
      case '~':
        pieces[util.pos2key([col, row] as cg.Pos)].promoted = true
        break
      default:
        const nb = ~~c
        if (nb) col += nb
        else {
          ++col
          const role = c.toLowerCase()
          pieces[util.pos2key([col, row] as cg.Pos)] = {
            role: roles[role],
            color: (c === role ? 'black' : 'white') as Color
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
    util.invRanks.map(function(y) {
      return util.ranks.map(function(x) {
        const piece = pieces[util.pos2key([x, y])]
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
