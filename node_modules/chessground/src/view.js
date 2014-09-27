var partial = require('lodash-node/modern/functions/partial');
var util = require('./util');
var board = require('./board');
var drag = require('./drag');
var anim = require('./anim');

function pieceClass(p) {
  return ['cg-piece', p.role, p.color].join(' ');
}

function renderPiece(ctrl, key, p) {
  var attrs = {
    style: {},
    class: pieceClass(p)
  };
  var draggable = ctrl.data.draggable.current;
  if (draggable.orig === key && (draggable.pos[0] !== 0 || draggable.pos[1] !== 0)) {
    attrs.style = {
      webkitTransform: util.translate([
        draggable.pos[0] + draggable.dec[0],
        draggable.pos[1] + draggable.dec[1]
      ])
    };
    attrs.class += ' dragging';
  } else if (ctrl.data.animation.current.anims) {
    var animation = ctrl.data.animation.current.anims[key];
    if (animation) {
      attrs.style = {
        webkitTransform: util.translate(animation[1])
      };
    }
  }
  return {
    tag: 'div',
    attrs: attrs
  };
}

function renderGhost(p) {
  return {
    tag: 'div',
    attrs: {
      class: pieceClass(p) + ' ghost'
    }
  };
}

function renderSquare(ctrl, pos) {
  var styleX = (pos[0] - 1) * 12.5 + '%';
  var styleY = (pos[1] - 1) * 12.5 + '%';
  var file = util.files[pos[0] - 1];
  var rank = pos[1];
  var key = file + rank;
  var piece = ctrl.data.pieces[key];
  var attrs = {
    class: util.classSet({
      'cg-square': true,
      'selected': ctrl.data.selected === key,
      'check': ctrl.data.check === key,
      'last-move': util.contains2(ctrl.data.lastMove, key),
      'move-dest': util.containsX(ctrl.data.movable.dests[ctrl.data.selected], key),
      'premove-dest': util.containsX(ctrl.data.premovable.dests, key),
      'current-premove': util.contains2(ctrl.data.premovable.current, key),
      'drag-over': ctrl.data.draggable.current.over === key
    }),
    style: ctrl.data.orientation === 'white' ? {
      left: styleX,
      bottom: styleY
    } : {
      right: styleX,
      top: styleY
    }
  };
  if (pos[1] === (ctrl.data.orientation === 'white' ? 1 : 8)) attrs['data-coord-x'] = file;
  if (pos[0] === (ctrl.data.orientation === 'white' ? 8 : 1)) attrs['data-coord-y'] = rank;
  var children = [];
  if (piece) {
    children.push(renderPiece(ctrl, key, piece));
    if (ctrl.data.draggable.current.orig === key && ctrl.data.draggable.showGhost) {
      children.push(renderGhost(piece));
    }
  }
  return {
    tag: 'div',
    attrs: attrs,
    children: children
  };
}

function renderDraggingSquare(cur) {
  var squareSize = cur.bounds.width / 8;
  var size = squareSize * 2;
  var pos = util.key2pos(cur.over);
  return {
    tag: 'div',
    attrs: {
      id: 'cg-square-target',
      style: {
        width: size + 'px',
        height: size + 'px',
        left: (cur.bounds.left + (pos[0] - 1.5) * squareSize) + 'px',
        top: (cur.bounds.top + (7.5 - pos[1]) * squareSize) + 'px',
      }
    }
  };
}

function renderBoard(ctrl) {
  //not using lodash.partial for raw perf, here
  var children = util.allPos.map(function(pos) {
    return renderSquare(ctrl, pos);
  });
  if (ctrl.data.draggable.current.over && ctrl.data.draggable.squareTarget)
    children.push(renderDraggingSquare(ctrl.data.draggable.current));
  return {
    tag: 'div',
    attrs: {
      class: 'cg-board',
      config: function(el, isUpdate, context) {
        if (isUpdate) return;
        ctrl.data.bounds = el.getBoundingClientRect.bind(el);
        ctrl.data.render = m.redraw
        var isTouch = util.isTouchDevice();
        var onstart = partial(drag.start, ctrl);
        var onmove = partial(drag.move, ctrl);
        var onend = partial(drag.end, ctrl);
        document.addEventListener(isTouch ? 'touchstart' : 'mousedown', onstart);
        document.addEventListener(isTouch ? 'touchmove' : 'mousemove', onmove);
        document.addEventListener(isTouch ? 'touchend' : 'mouseup', onend);
        context.onunload = function() {
          document.removeEventListener(isTouch ? 'touchstart' : 'mousedown', onstart);
          document.removeEventListener(isTouch ? 'touchmove' : 'mousemove', onmove);
          document.removeEventListener(isTouch ? 'touchend' : 'mouseup', onend);
        };
      }
    },
    children: children
  };
}

module.exports = renderBoard;
