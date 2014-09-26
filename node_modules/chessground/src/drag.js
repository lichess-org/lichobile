var board = require('./board');
var util = require('./util');
var m = require('mithril');

function start(e) {
  e.stopPropagation();
  e.preventDefault();
  if (!this.render) return; // needs the DOM element
  var position = util.eventPosition(e);
  var bounds = this.bounds();
  var orig = board.getKeyAtDomPos.call(this, position, bounds);
  var piece = this.pieces.get(orig);
  if (!piece || !board.isDraggable.call(this, orig)) return;
  this.draggable.current = {
    orig: orig,
    rel: position,
    pos: [0, 0],
    bounds: bounds,
    over: orig
  };
}

function move(e) {
  var cur = this.draggable.current;
  var position = util.eventPosition(e);

  if (cur.orig === undefined) return;

  cur.pos = [
    position[0] - cur.rel[0],
    position[1] - cur.rel[1]
  ];
  cur.over = board.getKeyAtDomPos.call(this, position, cur.bounds);
  this.render();
}

function end(e) {
  if (this.draggable.current.orig === undefined) return;
  var orig = this.draggable.current.orig,
  dest = this.draggable.current.over;
  if (orig !== dest) this.movable.dropped = dest;
  board.userMove.call(this, orig, dest);
  this.draggable.current = {};
  m.redraw();
}

module.exports = {
  start: start,
  move: move,
  end: end
};
