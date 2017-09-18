import { State } from '../../../../chessground/state'
import { BoardInterface } from '../'

function isDraggable(data: State, color: Color) {
  return data.movable.color === color && (
    data.turnColor === color || data.predroppable.enabled
  )
}

export default function(ctrl: BoardInterface, e: TouchEvent) {
  if (e.touches && e.touches.length > 1) return
  if (!ctrl.canDrop()) return
  const role = <Role>(e.target as HTMLElement).getAttribute('data-role'),
    color = <Color>(e.target as HTMLElement).getAttribute('data-color'),
    nb = (e.target as HTMLElement).getAttribute('data-nb')
  if (!role || !color || nb === '0') return
  if (!isDraggable(ctrl.chessground.state, color)) return
  e.stopPropagation()
  e.preventDefault()
  const piece = {
    role,
    color
  }
  ctrl.chessground.dragNewPiece(e, piece)
}
