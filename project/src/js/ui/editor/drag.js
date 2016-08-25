import { util, drag } from 'chessground-mobile';

export default function(ctrl, e) {
  if (e.touches && e.touches.length > 1) return; // support one finger touch only
  const role = e.target.getAttribute('data-role'),
  color = e.target.getAttribute('data-color');
  if (!role || !color) return;
  e.stopPropagation();
  e.preventDefault();
  const cgData = ctrl.chessground.data;
  const key = util.allKeys.find(k => {
    return !cgData.pieces[k];
  });
  if (!key) return;
  const coords = util.key2pos(cgData.orientation === 'white' ? key : util.invertKey(key));
  const piece = {
    role: role,
    color: color
  };
  const bounds = cgData.bounds;
  const squareBounds = util.computeSquareBounds(cgData.orientation, bounds, key);
  const position = util.eventPosition(e);
  const rel = [
    (coords[0] - 1) * squareBounds.width + bounds.left,
    (8 - coords[1]) * squareBounds.height + bounds.top
  ];
  const dragOpts = {
    orig: key,
    rel: rel,
    epos: position,
    pos: [position[0] - rel[0], position[1] - rel[1]],
    dec: [-squareBounds.width, -squareBounds.height],
    bounds: bounds,
    started: true,
    originTarget: e.target
  };
  ctrl.chessground.setDragPiece(key, piece, dragOpts);
  // must render synchronously to have dragging piece
  cgData.render();
  cgData.draggable.current.draggingPiece = cgData.element.querySelector('.' + key + ' > piece');
  cgData.draggable.current.draggingPiece.classList.add('dragging');
  if (cgData.draggable.magnified) {
    cgData.draggable.current.draggingPiece.classList.add('magnified');
  }
  cgData.draggable.current.draggingPiece.cgDragging = true;
  drag.processDrag(cgData);
}
