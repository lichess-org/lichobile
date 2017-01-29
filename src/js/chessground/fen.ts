import util from './util';

const initial = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';

const roles = {
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

function read(fen: string) {
  if (fen === 'start') fen = initial;
  const pieces = {};
  const space = fen.indexOf(' ');
  const first = space !== -1 ? fen.substr(0, space) : fen;
  const parts = first.split('/');
  for (let i = 0; i < 8; i++) {
    let row = parts[i];
    let x = 0;
    for (let j = 0, jlen = row.length; j < jlen; j++) {
      let v = row[j];
      if (v === '~') continue;
      let nb = ~~v;
      if (nb) x += nb;
      else {
        x++;
        pieces[util.pos2key([x, 8 - i])] = {
          role: roles[v],
          color: v === v.toLowerCase() ? 'black' : 'white'
        };
      }
    }
  }

  return pieces;
}

function write(pieces: Piece[]) {
  return [8, 7, 6, 5, 4, 3, 2].reduce(
    function(str, nb) {
      return str.replace(new RegExp(Array(nb + 1).join('1'), 'g'), String(nb));
    },
    util.invRanks.map(function(y) {
      return util.ranks.map(function(x) {
        const piece = pieces[util.pos2key([x, y])];
        if (piece) {
          const letter = letters[piece.role];
          return piece.color === 'white' ? letter.toUpperCase() : letter;
        } else return '1';
      }).join('');
    }).join('/'));
}

export default {
  initial,
  read,
  write
}
