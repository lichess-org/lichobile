import { util, drag } from 'chessground-mobile';
import gameApi from '../../../lichess/game';

export default function(ctrl, e) {
  console.log(e);
  if (e.button !== undefined && e.button !== 0) return; // only touch or left click
  if (ctrl.replaying() || !gameApi.isPlayerPlaying(ctrl.data)) return;
  const cgData = ctrl.chessground.data;
  const role = e.target.getAttribute('data-role'),
    color = e.target.getAttribute('data-color'),
    number = e.target.getAttribute('data-nb');
  if (!role || !color || number === '0') return;
  e.stopPropagation();
  e.preventDefault();
  var key;
  for (var i in util.allKeys) {
    if (!ctrl.chessground.data.pieces[util.allKeys[i]]) {
      key = util.allKeys[i];
      break;
    }
  }
  if (!key) return;
  const coords = util.key2pos(ctrl.chessground.data.orientation === 'white' ? key : util.invertKey(key));
  const piece = {
    role: role,
    color: color
  };
  const obj = {};
  obj[key] = piece;
  ctrl.chessground.setPieces(obj);
  const bounds = ctrl.chessground.data.bounds;
  const position = util.eventPosition(e);
  const squareBounds = util.computeSquareBounds(cgData.orientation, cgData.bounds, key);
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
  ctrl.chessground.data.render();
  ctrl.chessground.data.draggable.current.draggingPiece = ctrl.chessground.data.element.querySelector('.' + key + ' > piece');
  drag.processDrag(ctrl.chessground.data);
}
