import { TablebaseCategory } from './interfaces'
import { oppositeColor } from '../../../utils'

export function colorOf(fen: Fen): Color {
  return fen.split(' ')[1] === 'w' ? 'white' : 'black'
}

export function winnerBeforeMove(stm: Color, category: TablebaseCategory): Color | undefined {
  if (category === 'loss' || category === 'maybe-loss' || category === 'blessed-loss')
    return stm
  if (category === 'win' || category === 'maybe-win' || category === 'cursed-win')
    return oppositeColor(stm)
}
