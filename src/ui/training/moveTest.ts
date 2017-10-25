import { path as treePath, Tree } from '../shared/tree'
import { decomposeUci, sanToRole } from '../../utils/chessFormat'
import { Puzzle, Line, LineFeedback  } from '../../lichess/interfaces/training'
import { MoveRequest } from '../../chess'
import { Mode, Feedback } from './interfaces'

const altCastles: StringMap = {
  e1a1: 'e1c1',
  e1h1: 'e1g1',
  e8a8: 'e8c8',
  e8h8: 'e8g8'
}

export default function moveTest(
  mode: Mode,
  node: Tree.Node,
  path: Tree.Path,
  initialPath: Tree.Path,
  nodeList: Tree.Node[],
  puzzle: Puzzle
): Feedback | MoveRequest | null {

  if (mode === 'view') return null
  if (!treePath.contains(path, initialPath)) return null

  // puzzle moves so far
  const progress: Uci[] = nodeList
  .slice(treePath.size(initialPath) + 1)
  // at this point we know node has uci (every node except first has uci)
  .map(node => node.uci!)

  // search in puzzle lines with current progress
  const curLine = progress.reduce((acc: Line, uci: Uci) => {
    if (!acc) return undefined
    if (isLineFeedback(acc)) return acc
    return acc[uci] || acc[altCastles[uci]]
  }, puzzle.lines)

  if (!curLine) {
    const feedback = 'fail'
    node.puzzle = feedback
    return feedback
  }
  else if (isLineFeedback(curLine)) {
    node.puzzle = curLine
    return curLine
  }
  else {
    // next opponent move from line
    const nextUci = Object.keys(curLine)[0]
    if (curLine[nextUci] === 'win') {
      node.puzzle = 'win'
      return 'win'
    }
    else {
      node.puzzle = 'good'
      const opponentUci = decomposeUci(nextUci)
      const promotion = opponentUci[2] ?  sanToRole[opponentUci[2].toUpperCase()] : null
      const move: MoveRequest = {
        variant: 'standard',
        orig: opponentUci[0],
        dest: opponentUci[1],
        fen: node.fen,
        path: path
      }
      if (promotion) move.promotion = promotion

      return move
    }
  }
}

function isLineFeedback(v: Line): v is LineFeedback {
  return typeof v === 'string'
}
