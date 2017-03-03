import chessground from '../../../../chessground';
import { BoardInterface } from '../'

function isDraggable(data: any, color: Color) {
  return data.movable.color === color && (
    data.turnColor === color || data.predroppable.enabled
  );
}

export default function(ctrl: BoardInterface, e: TouchEvent) {
  if (e.touches && e.touches.length > 1) return; // support one finger touch only
  if (!ctrl.canDrop()) return;
  const cgData = ctrl.chessground.data;
  const role = <Role>(e.target as HTMLElement).getAttribute('data-role'),
    color = <Color>(e.target as HTMLElement).getAttribute('data-color'),
    number = (e.target as HTMLElement).getAttribute('data-nb');
  if (!role || !color || number === '0') return;
  if (!isDraggable(ctrl.chessground.data, color)) return;
  e.stopPropagation();
  e.preventDefault();
  let key;
  for (let i in chessground.util.allKeys) {
    if (!cgData.pieces[chessground.util.allKeys[i]]) {
      key = chessground.util.allKeys[i];
      break;
    }
  }
  if (!key) return;
  const coords = chessground.util.key2pos(cgData.orientation === 'white' ? key : chessground.util.invertKey(key));
  const piece = {
    role,
    color
  }
  const obj = {};
  obj[key] = piece;
  ctrl.chessground.setPieces(obj);
  const bounds = cgData.bounds;
  const position = chessground.util.eventPosition(e);
  const squareBounds = chessground.util.computeSquareBounds(cgData.orientation, bounds, key);
  const rel = [
    (coords[0] - 1) * squareBounds.width + bounds.left,
    (8 - coords[1]) * squareBounds.height + bounds.top
  ];
  const dragOpts = {
    orig: key,
    rel: rel,
    epos: position,
    pos: [position[0] - rel[0], position[1] - rel[1]],
    dec: cgData.draggable.magnified ?
      [-squareBounds.width, -squareBounds.height * 2] :
      [-squareBounds.width / 2, -squareBounds.height / 2],
    bounds: bounds,
    origPos: chessground.util.key2pos(key),
    originTarget: e.target,
    started: true,
    newPiece: true
  };
  ctrl.chessground.setDragPiece(key, piece, dragOpts);
  // must render synchronously to have dragging piece
  cgData.render();
  cgData.draggable.current.draggingPiece = chessground.drag.getPieceByKey(cgData, key);
  cgData.draggable.current.draggingPiece.classList.add('dragging');
  if (cgData.draggable.magnified) {
    cgData.draggable.current.draggingPiece.classList.add('magnified');
  }
  cgData.draggable.current.draggingPiece.cgDragging = true;
  chessground.drag.processDrag(cgData);
}
