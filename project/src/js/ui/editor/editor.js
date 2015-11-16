import mapValues from 'lodash/object/mapValues';
import m from 'mithril';

export function castlesAt(v) {
  return mapValues({
    K: v,
    Q: v,
    k: v,
    q: v
  }, m.prop);
}

export function fenMetadatas(data) {
  var castlesStr = '';
  Object.keys(data.castles).forEach(function(piece) {
    if (data.castles[piece]()) castlesStr += piece;
  });
  return data.color() + ' ' + (castlesStr.length ? castlesStr : '-') + ' ' + data.enpassant() + ' ' + data.halfmove() + ' ' + data.moves();
}

export function computeFen(data, getBaseFen) {
  return getBaseFen() + ' ' + fenMetadatas(data);
}

export function readFen(fen) {
  const parts = fen.split(' ');
  return {
    color: m.prop(parts[1]),
    castles: {
      K: m.prop(parts[2].includes('K')),
      Q: m.prop(parts[2].includes('Q')),
      k: m.prop(parts[2].includes('k')),
      q: m.prop(parts[2].includes('q'))
    },
    enpassant: m.prop(parts[3]),
    halfmove: m.prop(parts[4]),
    moves: m.prop(parts[5])
  };
}

// function taken from chess.js
export function validateFen(fen) {
  var errors = {
     0: 'No errors.',
     1: 'FEN string must contain six space-delimited fields.',
     2: '6th field (move number) must be a positive integer.',
     3: '5th field (half move counter) must be a non-negative integer.',
     4: '4th field (en-passant square) is invalid.',
     5: '3rd field (castling availability) is invalid.',
     6: '2nd field (side to move) is invalid.',
     7: '1st field (piece positions) does not contain 8 \'/\'-delimited rows.',
     8: '1st field (piece positions) is invalid [consecutive numbers].',
     9: '1st field (piece positions) is invalid [invalid piece].',
    10: '1st field (piece positions) is invalid [row too large].'
  };

  /* 1st criterion: 6 space-seperated fields? */
  var tokens = fen.split(/\s+/);
  if (tokens.length !== 6) {
    return {valid: false, error_number: 1, error: errors[1]};
  }

  /* 2nd criterion: move number field is a integer value > 0? */
  if (isNaN(tokens[5]) || (parseInt(tokens[5], 10) <= 0)) {
    return {valid: false, error_number: 2, error: errors[2]};
  }

  /* 3rd criterion: half move counter is an integer >= 0? */
  if (isNaN(tokens[4]) || (parseInt(tokens[4], 10) < 0)) {
    return {valid: false, error_number: 3, error: errors[3]};
  }

  /* 4th criterion: 4th field is a valid e.p.-string? */
  if (!/^(-|[abcdefgh][36])$/.test(tokens[3])) {
    return {valid: false, error_number: 4, error: errors[4]};
  }

  /* 5th criterion: 3th field is a valid castle-string? */
  if( !/^(KQ?k?q?|Qk?q?|kq?|q|-)$/.test(tokens[2])) {
    return {valid: false, error_number: 5, error: errors[5]};
  }

  /* 6th criterion: 2nd field is "w" (white) or "b" (black)? */
  if (!/^(w|b)$/.test(tokens[1])) {
    return {valid: false, error_number: 6, error: errors[6]};
  }

  /* 7th criterion: 1st field contains 8 rows? */
  var rows = tokens[0].split('/');
  if (rows.length !== 8) {
    return {valid: false, error_number: 7, error: errors[7]};
  }

  /* 8th criterion: every row is valid? */
  for (var i = 0; i < rows.length; i++) {
    /* check for right sum of fields AND not two numbers in succession */
    var sum_fields = 0;
    var previous_was_number = false;

    for (var k = 0; k < rows[i].length; k++) {
      if (!isNaN(rows[i][k])) {
        if (previous_was_number) {
          return {valid: false, error_number: 8, error: errors[8]};
        }
        sum_fields += parseInt(rows[i][k], 10);
        previous_was_number = true;
      } else {
        if (!/^[prnbqkPRNBQK]$/.test(rows[i][k])) {
          return {valid: false, error_number: 9, error: errors[9]};
        }
        sum_fields += 1;
        previous_was_number = false;
      }
    }
    if (sum_fields !== 8) {
      return {valid: false, error_number: 10, error: errors[10]};
    }
  }

  /* everything's okay! */
  return {valid: true, error_number: 0, error: errors[0]};
}


export function positionLooksLegit(fen) {
  const pieces = fen.split(' ')[0];
  return (pieces.match(/k/g) || []).length === 1 && (pieces.match(/K/g) || []).length === 1;
}
