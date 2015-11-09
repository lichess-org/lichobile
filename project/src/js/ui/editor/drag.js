var find = require('lodash/collection/find');
var util = require('chessground').util;
var drag = require('chessground').drag;

module.exports = function(ctrl, e) {
  if (e.button !== undefined && e.button !== 0) return; // only left click
  if (e.touches && e.touches.length > 1) return; // support one finger touch only
  var role = e.target.getAttribute('data-role'),
  color = e.target.getAttribute('data-color');
  if (!role || !color) return;
  e.stopPropagation();
  e.preventDefault();
  var key = find(util.allKeys, function(k) {
    return !ctrl.chessground.data.pieces[k];
  });
  if (!key) return;
  var coords = util.key2pos(ctrl.chessground.data.orientation === 'white' ? key : util.invertKey(key));
  var piece = {
    role: role,
    color: color
  };
  var obj = {};
  obj[key] = piece;
  ctrl.chessground.setPieces(obj);
  var bounds = ctrl.chessground.data.bounds;
  var squareBounds = e.target.parentNode.getBoundingClientRect();
  var position = util.eventPosition(e);
  var rel = [
    (coords[0] - 1) * squareBounds.width + bounds.left,
    (8 - coords[1]) * squareBounds.height + bounds.top
  ];
  // must render synchrously to find piece with querySelector after
  ctrl.chessground.data.render();
  ctrl.chessground.data.draggable.current = {
    orig: key,
    piece: ctrl.chessground.data.pieces[key],
    rel: rel,
    epos: position,
    pos: [position[0] - rel[0], position[1] - rel[1]],
    dec: [-squareBounds.width, -squareBounds.height],
    bounds: bounds,
    started: true,
    originTarget: e.target,
    draggingPiece: ctrl.chessground.data.element.querySelector('.' + key + ' > .cg-piece')
  };
  ctrl.chessground.data.renderRAF();
  drag.processDrag(ctrl.chessground.data);
};
