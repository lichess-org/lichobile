import EditorCtrl from './EditorCtrl'

export default function(ctrl: EditorCtrl, e: TouchEvent) {
  if (e.touches && e.touches.length > 1) return // support one finger touch only
  const role = (e.target as HTMLElement).getAttribute('data-role'),
  color = (e.target as HTMLElement).getAttribute('data-color')
  if (!role || !color) return
  e.stopPropagation()
  e.preventDefault()
  const piece: Piece = {
    role: (role as Role),
    color: (color as Color)
  }
  ctrl.chessground.dragNewPiece(e, piece, true)
}
