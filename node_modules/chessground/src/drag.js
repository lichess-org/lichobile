var board = require('./board');
var util = require('./util');
var m = require('mithril');

function start(ctrl, e) {
  if (e.button !== undefined && e.button !== 0) return; // only touch or left click
  e.stopPropagation();
  e.preventDefault();
  var data = ctrl.data;
  var position = util.eventPosition(e);
  var bounds = data.bounds();
  var orig = board.getKeyAtDomPos(data, position, bounds);
  var piece = data.pieces[orig];
  board.selectSquare(data, orig);
  if (piece && board.isDraggable(data, orig)) {
    var pieceBounds = e.target.getBoundingClientRect();
    data.draggable.current = {
      orig: orig,
      rel: position,
      epos: position,
      pos: [0, 0],
      dec: data.draggable.centerPiece ? [
        position[0] - (pieceBounds.left + pieceBounds.width / 2),
        position[1] - (pieceBounds.top + pieceBounds.height / 2)
      ] : [0, 0],
      bounds: bounds,
      started: false
    };
  }
  processDrag(data);
}

function processDrag(data) {
  requestAnimationFrame(function() {
    var cur = data.draggable.current;
    if (cur.orig) {
      // cancel animations while dragging
      if (data.animation.current.start) data.animation.current = {};
      if (!cur.started && util.distance(cur.epos, cur.rel) >= data.draggable.distance)
        cur.started = true;
      if (cur.started) {
        cur.pos = [
          cur.epos[0] - cur.rel[0],
          cur.epos[1] - cur.rel[1]
        ];
        cur.over = board.getKeyAtDomPos(data, cur.epos, cur.bounds);
      }
    }
    data.render();
    if (cur.orig) processDrag(data);
  });
}

function move(ctrl, e) {
  if (ctrl.data.draggable.current.orig)
    ctrl.data.draggable.current.epos = util.eventPosition(e);
}

function end(ctrl, e) {
  var draggable = ctrl.data.draggable;
  var orig = draggable.current.orig;
  if (!orig) return;
  if (draggable.current.started) {
    dest = draggable.current.over;
    if (orig !== dest) ctrl.data.movable.dropped = [orig, dest];
    board.userMove(ctrl.data, orig, dest);
  }
  draggable.current = {};
}

module.exports = {
  start: start,
  move: move,
  end: end,
  processDrag: processDrag
};
