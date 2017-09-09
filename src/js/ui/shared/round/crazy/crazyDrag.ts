import * as cgUtil from '../../../../chessground/util'
import cgDrag from '../../../../chessground/drag'
import { BoardInterface } from '../'

function isDraggable(data: any, color: Color) {
  return data.movable.color === color && (
    data.turnColor === color || data.predroppable.enabled
  )
}

// TODO refactor
export default function(ctrl: BoardInterface, e: TouchEvent) {
  if (e.touches && e.touches.length > 1) return
  if (!ctrl.canDrop()) return
  const cgData = ctrl.chessground.state
  const role = <Role>(e.target as HTMLElement).getAttribute('data-role'),
    color = <Color>(e.target as HTMLElement).getAttribute('data-color'),
    nb = (e.target as HTMLElement).getAttribute('data-nb')
  if (!role || !color || nb === '0') return
  if (!isDraggable(ctrl.chessground.state, color)) return
  e.stopPropagation()
  e.preventDefault()
  const key = cgUtil.allKeys.find((k: Key) => {
    return !cgData.pieces[k]
  })
  if (!key) return
  const coords = cgUtil.key2pos(cgData.orientation === 'white' ? key : cgUtil.invertKey(key))
  const piece = {
    role,
    color
  }
  const obj: {[k: string]: Piece } = {}
  obj[key] = piece
  ctrl.chessground.setPieces(obj)
  // TODO refactor
  const bounds = ctrl.chessground.dom!.bounds
  const position = cgUtil.eventPosition(e)
  const squareBounds = cgUtil.computeSquareBounds(cgData.orientation, bounds, key)
  const rel = [
    (coords[0] - 1) * squareBounds.width + bounds.left,
    (8 - coords[1]) * squareBounds.height + bounds.top
  ]
  const dragOpts = {
    orig: key,
    rel: rel,
    epos: position,
    pos: [position[0] - rel[0], position[1] - rel[1]],
    dec: cgData.draggable.magnified ?
      [-squareBounds.width, -squareBounds.height * 2] :
      [-squareBounds.width / 2, -squareBounds.height / 2],
    bounds: bounds,
    origPos: cgUtil.key2pos(key),
    originTarget: e.target,
    started: true,
    showGhost: false,
    newPiece: true
  }
  ctrl.chessground.setDragPiece(key, piece, dragOpts)
  // must render synchronously to have dragging piece
  ctrl.chessground.redrawSync()
  if (cgData.draggable.current) {
    const pieceEl =
      cgData.draggable.current.draggingPiece =
      cgUtil.getPieceByKey(ctrl.chessground.dom!, key)

    if (pieceEl) {
      pieceEl.classList.add('dragging')
      if (cgData.draggable.magnified) {
        pieceEl.classList.add('magnified')
      }
      pieceEl.cgDragging = true
      cgDrag.processDrag(ctrl.chessground)
    }
  }
}
