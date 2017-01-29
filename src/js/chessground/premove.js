import util from './util'

function diff(a, b) {
  return Math.abs(a - b);
}

function pawn(color, x1, y1, x2, y2) {
  return diff(x1, x2) < 2 && (
    color === 'white' ? (
      // allow 2 squares from 1 and 8, for horde
      y2 === y1 + 1 || (y1 <= 2 && y2 === (y1 + 2) && x1 === x2)
    ) : (
      y2 === y1 - 1 || (y1 >= 7 && y2 === (y1 - 2) && x1 === x2)
    )
  );
}

function knight(x1, y1, x2, y2) {
  var xd = diff(x1, x2);
  var yd = diff(y1, y2);
  return (xd === 1 && yd === 2) || (xd === 2 && yd === 1);
}

function bishop(x1, y1, x2, y2) {
  return diff(x1, x2) === diff(y1, y2);
}

function rook(x1, y1, x2, y2) {
  return x1 === x2 || y1 === y2;
}

function queen(x1, y1, x2, y2) {
  return bishop(x1, y1, x2, y2) || rook(x1, y1, x2, y2);
}

function king(color, rookFiles, canCastle, x1, y1, x2, y2) {
  return (
    diff(x1, x2) < 2 && diff(y1, y2) < 2
  ) || (
    canCastle && y1 === y2 && y1 === (color === 'white' ? 1 : 8) && (
      (x1 === 5 && (x2 === 3 || x2 === 7)) || util.containsX(rookFiles, x2)
    )
  );
}

function rookFilesOf(pieces, color) {
  return Object.keys(pieces).filter(function(key) {
    var piece = pieces[key];
    return piece && piece.color === color && piece.role === 'rook';
  }).map(function(key) {
    return util.key2pos(key)[0];
  });
}

export default function compute(pieces, key, canCastle) {
  var piece = pieces[key];
  var pos = util.key2pos(key);
  var mobility;
  switch (piece.role) {
    case 'pawn':
      mobility = pawn.bind(null, piece.color);
      break;
    case 'knight':
      mobility = knight;
      break;
    case 'bishop':
      mobility = bishop;
      break;
    case 'rook':
      mobility = rook;
      break;
    case 'queen':
      mobility = queen;
      break;
    case 'king':
      mobility = king.bind(null, piece.color, rookFilesOf(pieces, piece.color), canCastle);
      break;
  }
  return util.allPos.filter(function(pos2) {
    return (pos[0] !== pos2[0] || pos[1] !== pos2[1]) && mobility(pos[0], pos[1], pos2[0], pos2[1]);
  }).map(util.pos2key);
}
