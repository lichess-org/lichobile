export const emptyFen = '8/8/8/8/8/8/8/8 w - - 0 1'

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

export function validateFen(fen: string, variant: VariantKey = 'standard') {
  const tokens = fen.split(/\s+/)
  const rows = tokens[0].split('/')

  if (variant === 'threeCheck')
    return validateThreeCheck(tokens, rows) && validateTokens(tokens) && validateRows(rows)

  else if (variant === 'crazyhouse')
    return validateCrazy(tokens, rows) && validateTokens(tokens) && validateCrazyRows(rows)

  else
    return validateStandard(tokens, rows) && validateTokens(tokens) && validateRows(rows)
}

function validateStandard(tokens: string[], rows: string[]) {
  /* 6 space-seperated fields? */
  if (tokens.length !== 6) {
    return false
  }

  /* 1st field contains 8 rows? */
  if (rows.length !== 8) {
    return false
  }

  return true
}

function validateThreeCheck(tokens: string[], rows: string[]) {
  /* 7 space-seperated fields? */
  if (tokens.length !== 7) {
    return false
  }

  /* 1st field contains 8 rows? */
  if (rows.length !== 8) {
    return false
  }

  return true
}

function validateCrazy(tokens: string[], rows: string[]) {
  /* 6 space-seperated fields? */
  if (tokens.length !== 6) {
    return false
  }

  /* 1st field contains 9 rows? */
  if (rows.length !== 9) {
    return false
  }

  return true
}

function validateRows(rows: string[]): boolean {
  /* every row is valid? */
  for (let i = 0; i < rows.length; i++) {
    /* check for right sum of fields AND not two numbers in succession */
    let sum_fields = 0
    let previous_was_number = false

    for (let k = 0; k < rows[i].length; k++) {
      if (!isNaN(Number(rows[i][k]))) {
        if (previous_was_number) {
          return false
        }
        sum_fields += parseInt(rows[i][k], 10)
        previous_was_number = true
      } else {
        if (!/^[prnbqkPRNBQK]$/.test(rows[i][k])) {
          return false
        }
        sum_fields += 1
        previous_was_number = false
      }
    }
    if (sum_fields !== 8) {
      return false
    }
  }

  return true
}

function validateCrazyRows(rows: string[]): boolean {
  /* every row is valid? */
  for (let i = 0; i < rows.length - 1; i++) {
    /* check for right sum of fields AND not two numbers in succession */
    let sum_fields = 0
    let previous_was_number = false

    for (let k = 0; k < rows[i].length; k++) {
      if (!isNaN(Number(rows[i][k]))) {
        if (previous_was_number) {
          return false
        }
        sum_fields += parseInt(rows[i][k], 10)
        previous_was_number = true
      } else {
        if (!/^[prnbqkPRNBQK]$/.test(rows[i][k])) {
          return false
        }
        sum_fields += 1
        previous_was_number = false
      }
    }
    if (sum_fields !== 8) {
      return false
    }
  }

  return true
}

// fen validation taken from https://github.com/jhlywa/chess.js/blob/master/chess.js
// modified for lichobile
function validateTokens(tokens: string[]): boolean {
  /* move number field is a integer value > 0? */
  if (isNaN(Number(tokens[5])) || (parseInt(tokens[5], 10) <= 0)) {
    return false
  }

  /* half move counter is an integer >= 0? */
  if (isNaN(Number(tokens[4])) || (parseInt(tokens[4], 10) < 0)) {
    return false
  }

  /* 4th field is a valid e.p.-string? */
  if (!/^(-|[abcdefgh][36])$/.test(tokens[3])) {
    return false
  }

  /* 3th field is a valid castle-string? */
  if ( !/^(KQ?k?q?|Qk?q?|kq?|q|-)$/.test(tokens[2])) {
    return false
  }

  /* 2nd field is "w" (white) or "b" (black)? */
  if (!/^(w|b)$/.test(tokens[1])) {
    return false
  }

  return true
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
