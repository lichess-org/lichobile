import cgFen from '../../../chessground/fen'
import { key2pos } from '../../../chessground/util'
import svgPieces from './pieces'

type BoardPos = [number, number]

export function makeBoard(fen: string, orientation: Color) {
  const pieces = cgFen.read(fen)
  let b = '<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360">'
  for (const [k, p] of pieces) {
    const pos = pos2px(orient(key2pos(k), orientation))
    b += makePiece(pos, p)
  }
  b += '</svg>'
  return b
}

function orient(pos: BoardPos, color: Color): BoardPos {
  return color === 'white' ? pos : [9 - pos[0], 9 - pos[1]]
}

function pos2px(pos: BoardPos): BoardPos {
  return [(pos[0] - 1) * 45, (8 - pos[1]) * 45]
}

function makePiece(pos: BoardPos, piece: Piece) {
  let name = piece.color === 'white' ? 'w' : 'b'
  name += (piece.role === 'knight' ? 'n' : piece.role[0]).toUpperCase()
  return '<svg x="' + pos[0] + '" y="' + pos[1] + '" width="45" height="45">' +
    svgPieces[name] +
    '</svg>'
}
