import * as util from './util'
import * as cg from './interfaces'

type Mobility = (x1: number, y1: number, x2: number, y2: number) => boolean

function diff(a: number, b: number): number {
  return Math.abs(a - b)
}

function pawn(color: Color): Mobility {
  return (x1, y1, x2, y2) => diff(x1, x2) < 2 && (
    color === 'white' ? (
      // allow 2 squares from 1 and 8, for horde
      y2 === y1 + 1 || (y1 <= 2 && y2 === (y1 + 2) && x1 === x2)
    ) : (
      y2 === y1 - 1 || (y1 >= 7 && y2 === (y1 - 2) && x1 === x2)
    )
  )
}

const knight: Mobility = (x1, y1, x2, y2) => {
  const xd = diff(x1, x2)
  const yd = diff(y1, y2)
  return (xd === 1 && yd === 2) || (xd === 2 && yd === 1)
}

const bishop: Mobility = (x1, y1, x2, y2) => {
  return diff(x1, x2) === diff(y1, y2)
}

const rook: Mobility = (x1, y1, x2, y2) => {
  return x1 === x2 || y1 === y2
}

const queen: Mobility = (x1, y1, x2, y2) => {
  return bishop(x1, y1, x2, y2) || rook(x1, y1, x2, y2)
}

function king(color: Color, rookFiles: number[], canCastle: boolean): Mobility {
  return (x1, y1, x2, y2)  => (
    diff(x1, x2) < 2 && diff(y1, y2) < 2
  ) || (
    canCastle && y1 === y2 && y1 === (color === 'white' ? 1 : 8) && (
      (x1 === 5 && (x2 === 3 || x2 === 7)) || util.containsX(rookFiles, x2)
    )
  )
}

function rookFilesOf(pieces: cg.Pieces, color: Color): number[] {
  const files = []
  for (const [k, piece] of pieces) {
    if (piece && piece.color === color && piece.role === 'rook') {
      files.push(util.key2pos(k)[0])
    }
  }
  return files
}

export default function premove(pieces: cg.Pieces, key: Key, canCastle: boolean): Key[] {
  const piece = pieces.get(key)
  if (!piece) {
    return []
  }
  const pos = util.key2pos(key)
  let mobility: Mobility
  switch (piece.role) {
    case 'pawn':
      mobility = pawn(piece.color)
      break
    case 'knight':
      mobility = knight
      break
    case 'bishop':
      mobility = bishop
      break
    case 'rook':
      mobility = rook
      break
    case 'queen':
      mobility = queen
      break
    case 'king':
      mobility = king(piece.color, rookFilesOf(pieces, piece.color), canCastle)
      break
  }
  return util.allKeys.map(util.key2pos)
  .filter(pos2 =>
    (pos[0] !== pos2[0] || pos[1] !== pos2[1]) && mobility(pos[0], pos[1], pos2[0], pos2[1])
  )
  .map(util.pos2key)
}
