export const emptyFen = '8/8/8/8/8/8/8/8 w - - 0 1'
export const standardFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

export function readFen(fen: string) {
  const parts = fen.split(' ')
  return {
    color: parts[1],
    castles: {
      K: parts[2].includes('K'),
      Q: parts[2].includes('Q'),
      k: parts[2].includes('k'),
      q: parts[2].includes('q')
    },
    enpassant: parts[3],
    halfmove: Number(parts[4]),
    moves: Number(parts[5])
  }
}

// clean a FEN string from a lichess.org URI path.
export function cleanFenUri(fenUri: string): string {
  let fen = fenUri.replace(/_/g, ' ')
  if (fen[0] === '/') fen = fen.substring(1)
  return fen
}

// function taken from chess.js
export function validateFen(fen: string) {
  const errors = {
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
  }

  /* 1st criterion: 6 space-seperated fields? */
  const tokens = fen.split(/\s+/)
  if (tokens.length !== 6) {
    return {valid: false, error_number: 1, error: errors[1]}
  }

  /* 2nd criterion: move number field is a integer value > 0? */
  if (isNaN(Number(tokens[5])) || (parseInt(tokens[5], 10) <= 0)) {
    return {valid: false, error_number: 2, error: errors[2]}
  }

  /* 3rd criterion: half move counter is an integer >= 0? */
  if (isNaN(Number(tokens[4])) || (parseInt(tokens[4], 10) < 0)) {
    return {valid: false, error_number: 3, error: errors[3]}
  }

  /* 4th criterion: 4th field is a valid e.p.-string? */
  if (!/^(-|[abcdefgh][36])$/.test(tokens[3])) {
    return {valid: false, error_number: 4, error: errors[4]}
  }

  /* 5th criterion: 3th field is a valid castle-string? */
  if ( !/^(KQ?k?q?|Qk?q?|kq?|q|-)$/.test(tokens[2])) {
    return {valid: false, error_number: 5, error: errors[5]}
  }

  /* 6th criterion: 2nd field is "w" (white) or "b" (black)? */
  if (!/^(w|b)$/.test(tokens[1])) {
    return {valid: false, error_number: 6, error: errors[6]}
  }

  /* 7th criterion: 1st field contains 8 rows? */
  const rows = tokens[0].split('/')
  if (rows.length !== 8) {
    return {valid: false, error_number: 7, error: errors[7]}
  }

  /* 8th criterion: every row is valid? */
  for (let i = 0; i < rows.length; i++) {
    /* check for right sum of fields AND not two numbers in succession */
    let sum_fields = 0
    let previous_was_number = false

    for (let k = 0; k < rows[i].length; k++) {
      if (!isNaN(Number(rows[i][k]))) {
        if (previous_was_number) {
          return {valid: false, error_number: 8, error: errors[8]}
        }
        sum_fields += parseInt(rows[i][k], 10)
        previous_was_number = true
      } else {
        if (!/^[prnbqkPRNBQK]$/.test(rows[i][k])) {
          return {valid: false, error_number: 9, error: errors[9]}
        }
        sum_fields += 1
        previous_was_number = false
      }
    }
    if (sum_fields !== 8) {
      return {valid: false, error_number: 10, error: errors[10]}
    }
  }

  /* everything's okay! */
  return {valid: true, error_number: 0, error: errors[0]}
}


export function positionLooksLegit(fen: string) {
  const pieces = fen.split(' ')[0]
  return (pieces.match(/k/g) || []).length === 1 && (pieces.match(/K/g) || []).length === 1
}

export function playerFromFen(fen?: string): Color {
  if (fen) {
    const { color } = readFen(fen)

    return color === 'w' ? 'white' : 'black'
  }

  return 'white'
}

export function plyFromFen(fen?: string) {
  if (fen) {
    const { color, moves } = readFen(fen)
    return moves * 2 - (color === 'w' ? 2 : 1)
  }

  return 0
}
