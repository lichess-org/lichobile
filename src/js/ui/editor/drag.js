import chessground from '../../chessground';

export default function(ctrl, e) {
  if (e.touches && e.touches.length > 1) return; // support one finger touch only
  const role = e.target.getAttribute('data-role'),
  color = e.target.getAttribute('data-color');
  if (!role || !color) return;
  e.stopPropagation();
  e.preventDefault();
  const cgData = ctrl.chessground.data;
  const key = chessground.util.allKeys.find(k => {
    return !cgData.pieces[k];
  });
  if (!key) return;
  const coords = chessground.util.key2pos(cgData.orientation === 'white' ? key : chessground.util.invertKey(key));
  const piece = {
    role: role,
    color: color
  };
  const bounds = cgData.bounds;
  const squareBounds = chessground.util.computeSquareBounds(cgData.orientation, bounds, key);
  const position = chessground.util.eventPosition(e);
  const rel = [
    (coords[0] - 1) * squareBounds.width + bounds.left,
    (8 - coords[1]) * squareBounds.height + bounds.top
  ];
  const dragOpts = {
    orig: key,
    origPos: chessground.util.key2pos(key),
    rel: rel,
    epos: position,
    pos: [position[0] - rel[0], position[1] - rel[1]],
    dec: cgData.draggable.magnified ?
      [-squareBounds.width, -squareBounds.height * 2] :
      [-squareBounds.width / 2, -squareBounds.height / 2],
    bounds: bounds,
    started: true,
    originTarget: e.target
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
