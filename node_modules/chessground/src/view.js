var util = require('./util');
var board = require('./board');
var drag = require('./drag');
var anim = require('./anim');

function pieceClass(p) {
  return ['cg-piece', p.role, p.color].join(' ');
}

function renderPiece(ctrl, key, p) {
  var attrs = {
    class: pieceClass(p)
  };
  var draggable = ctrl.board.draggable.current;
  if (draggable.orig === key) {
    attrs.style = {
      webkitTransform: util.translate(draggable.pos)
    };
    if (draggable.isDragging)
      attrs.class += ' dragging';
  } else if (ctrl.board.animation.current.anims) {
    var animation = ctrl.board.animation.current.anims[key];
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
  var piece = ctrl.board.pieces.get(key);
  var attrs = {
    class: util.classSet({
      'cg-square': true,
      'selected': ctrl.board.selected === key,
      'check': ctrl.board.check === key,
      'last-move': util.contains2(ctrl.board.lastMove, key),
      'move-dest': util.containsX(ctrl.board.movable.dests[ctrl.board.selected], key),
      'premove-dest': util.containsX(ctrl.board.premovable.dests, key),
      'current-premove': util.contains2(ctrl.board.premovable.current, key),
      'drag-over': ctrl.board.draggable.current.over === key
    }),
    style: ctrl.board.orientation === 'white' ? {
      left: styleX,
      bottom: styleY
    } : {
      right: styleX,
      top: styleY
    }
  };
  if (pos[1] === (ctrl.board.orientation === 'white' ? 1 : 8)) attrs['data-coord-x'] = file;
  if (pos[0] === (ctrl.board.orientation === 'white' ? 8 : 1)) attrs['data-coord-y'] = rank;
  var children = [];
  if (piece) {
    children.push(renderPiece(ctrl, key, piece));
    if (ctrl.board.draggable.current.orig === key) {
      children.push(renderGhost(piece));
    }
  }
  return {
    tag: 'div',
    attrs: attrs,
    children: children
  };
}

// from mithril source, more or less
function autoredraw(callback, node) {
  return function(e) {
    m.redraw.strategy("diff");
    m.startComputation();
    try {
      return callback.call(node, e);
    } finally {
      m.endComputation();
    }
  };
}

function renderBoard(ctrl) {
  var isTouch = util.isTouchDevice();
  var attrs = {
    class: 'cg-board',
    config: function(el, isUpdate, context) {
      if (!isUpdate) {
        ctrl.board.bounds = el.getBoundingClientRect.bind(el);
        ctrl.board.render = function() {
          m.render(el.parentNode, renderBoard(ctrl));
        };
        if (isTouch) el.addEventListener('touchstart', autoredraw(function(e) {
          drag.start.call(ctrl.board, e);
          ctrl.selectSquare(board.getKeyAtDomPos.call(ctrl.board, util.eventPosition(e)));
        }, el));
        document.addEventListener(isTouch ? 'touchmove' : 'mousemove', drag.move.bind(ctrl.board));
        document.addEventListener(isTouch ? 'touchend' : 'mouseup', drag.end.bind(ctrl.board));
      }
    }
  };
  if (!isTouch) {
    attrs.onmousedown = function(e) {
      if (e.button === 0) {
        drag.start.call(ctrl.board, e);
        ctrl.selectSquare(board.getKeyAtDomPos.call(ctrl.board, util.eventPosition(e)));
      }
    };
  }
  return {
    tag: 'div',
    attrs: attrs,
    children: util.allPos.map(function(pos) {
      return renderSquare(ctrl, pos);
    })
  };
}

module.exports = renderBoard;
