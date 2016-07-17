import { util, drag } from 'chessground-mobile';
import gameApi from '../../../lichess/game';

function isDraggable(data, color) {
  return data.movable.color === color && (
    data.turnColor === color || data.predroppable.enabled
  );
}

export default function(ctrl, e) {
  if (e.button !== undefined && e.button !== 0) return; // only touch or left click
  if (ctrl.replaying !== undefined && (ctrl.replaying() || !gameApi.isPlayerPlaying(ctrl.data))) return;
  const cgData = ctrl.chessground.data;
  const role = e.target.getAttribute('data-role'),
    color = e.target.getAttribute('data-color'),
    number = e.target.getAttribute('data-nb');
  if (!role || !color || number === '0') return;
  if (!isDraggable(ctrl.chessground.data, color)) return;
  e.stopPropagation();
  e.preventDefault();
  var key;
  for (var i in util.allKeys) {
    if (!cgData.pieces[util.allKeys[i]]) {
      key = util.allKeys[i];
      break;
    }
  }
  if (!key) return;
  const coords = util.key2pos(cgData.orientation === 'white' ? key : util.invertKey(key));
  const piece = {
    role: role,
    color: color
  };
  const obj = {};
  obj[key] = piece;
  ctrl.chessground.setPieces(obj);
  const bounds = cgData.bounds;
  const position = util.eventPosition(e);
  const squareBounds = util.computeSquareBounds(cgData.orientation, bounds, key);
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
    originTarget: e.target,
    started: true,
    newPiece: true
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
