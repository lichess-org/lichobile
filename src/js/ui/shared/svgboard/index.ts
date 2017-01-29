import chessground from '../../../chessground'
import svgPieces from './pieces'

interface Bounds {
  width: number
  height: number
}

type BoardPos = [number, number]

export function makeBoard(fen: string, orientation: Color, bounds: Bounds) {
  const pieces = chessground.fen.read(fen)
  const piecesKey = Object.keys(pieces)
  let b = '<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360">'
  for (let i = 0, len = piecesKey.length; i < len; i++) {
    let pos = pos2px(orient(chessground.util.key2pos(piecesKey[i]), orientation))
    b += makePiece(pos, pieces[piecesKey[i]])
  }
  b += '</svg>'
  return b
}

function orient(pos: BoardPos, color: Color): BoardPos {
  return color === 'white' ? pos : [9 - pos[0], 9 - pos[1]];
}

function pos2px(pos: BoardPos): BoardPos {
  return [(pos[0] - 1) * 45, (8 - pos[1]) * 45];
}

function makePiece(pos: BoardPos, piece: Piece) {
  let name = piece.color === 'white' ? 'w' : 'b';
  name += (piece.role === 'knight' ? 'n' : piece.role[0]).toUpperCase();
  return '<svg x="' + pos[0] + '" y="' + pos[1] + '" width="45" height="45">' +
    svgPieces[name] +
    '</svg>'
}
