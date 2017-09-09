import * as cgUtil from '../../chessground/util'
import cgDrag from '../../chessground/drag'
import Editor from './Editor'

export default function(ctrl: Editor, e: TouchEvent) {
  if (e.touches && e.touches.length > 1) return // support one finger touch only
  const role = (e.target as HTMLElement).getAttribute('data-role'),
  color = (e.target as HTMLElement).getAttribute('data-color')
  if (!role || !color) return
  e.stopPropagation()
  e.preventDefault()
  const cgData = ctrl.chessground.state
  const dom = ctrl.chessground.dom!
  const key = cgUtil.allKeys.find((k: Key) => {
    return !cgData.pieces[k]
  })
  if (!key) return
  const coords = cgUtil.key2pos(cgData.orientation === 'white' ? key : cgUtil.invertKey(key))
  const piece: Piece = {
    role: (role as Role),
    color: (color as Color)
  }
  const bounds = dom.bounds
  const squareBounds = cgUtil.computeSquareBounds(cgData.orientation, bounds, key)
  const position = cgUtil.eventPosition(e)
  const rel = [
    (coords[0] - 1) * squareBounds.width + bounds.left,
    (8 - coords[1]) * squareBounds.height + bounds.top
  ]
  const dragOpts = {
    orig: key,
    origPos: cgUtil.key2pos(key),
    rel: rel,
    epos: position,
    pos: [position[0] - rel[0], position[1] - rel[1]],
    dec: cgData.draggable.magnified ?
      [-squareBounds.width, -squareBounds.height * 2] :
      [-squareBounds.width / 2, -squareBounds.height / 2],
    started: true,
    showGhost: false,
    newPiece: true,
    originTarget: e.target
  }
  ctrl.chessground.setDragPiece(key, piece, dragOpts)
  // must render synchronously to have dragging piece
  ctrl.chessground.redrawSync()
  cgData.draggable.current!.draggingPiece = cgUtil.getPieceByKey(dom, key)
  cgDrag.processDrag(ctrl.chessground)
}
