var partial = require('lodash-node/modern/functions/partial');
var util = require('./util');
var premove = require('./premove');
var anim = require('./anim');

function callUserFunction(f) {
  setTimeout(f, 20);
}

function toggleOrientation(data) {
  data.orientation = util.opposite(data.orientation);
}

this.set = function(pieces) {
  forIn(pieces, function(piece, key) {
    if (piece) this.put(key, piece);
    else this.remove(key);
  }.bind(this));
};

function setPieces(data, pieces) {
  forIn(pieces, function(piece, key) {
    if (piece) data.pieces[key] = piece;
    else delete data.pieces[key];
  });
  data.movable.dropped = null;
}

function baseMove(data, orig, dest) {
  var success = anim(function() {
    if (orig === dest || !data.pieces[orig]) return false;
    data.pieces[dest] = data.pieces[orig];
    delete data.pieces[orig];
    data.lastMove = [orig, dest];
    data.check = null;
    callUserFunction(data.events.change);
    return true;
  }, data)();
  if (success) data.movable.dropped = null;
  return success;
}

function apiMove(data, orig, dest) {
  return baseMove(data, orig, dest);
}

function userMove(data, orig, dest) {
  if (!dest) {
    setSelected(data, null);
    if (data.movable.dropOff === 'trash') {
      delete data.pieces[orig];
      callUserFunction(data.events.change);
    }
  } else if (canMove(data, orig, dest)) {
    if (baseMove(data, orig, dest)) {
      setSelected(data, null);
      callUserFunction(partial(data.movable.events.after, orig, dest));
    }
  } else if (canPremove(data, orig, dest)) {
    data.premovable.current = [orig, dest];
    setSelected(data, null);
  } else if (isMovable(data, dest) || isPremovable(data, dest))
    setSelected(data, dest);
  else setSelected(data, null);
}

function selectSquare(data, key) {
  if (data.selected) {
    if (data.selected !== key) userMove(data, data.selected, key)
  } else if (isMovable(data, key) || isPremovable(data, key))
    setSelected(data, key);
}

function setSelected(data, key) {
  data.selected = key;
  if (key && isPremovable(data, key))
    data.premovable.dests = premove(data.pieces, key);
  else
    data.premovable.dests = null;
}

function isMovable(data, orig) {
  var piece = data.pieces[orig];
  return piece && (
    data.movable.color === 'both' || (
      data.movable.color === piece.color &&
      data.turnColor === piece.color
    ));
}

function canMove(data, orig, dest) {
  return orig !== dest && isMovable(data, orig) && (
    data.movable.free || util.containsX(data.movable.dests[orig], dest)
  );
}

function isPremovable(data, orig) {
  var piece = data.pieces[orig];
  return piece && data.premovable.enabled && (
    data.movable.color === piece.color &&
    data.turnColor !== piece.color
  );
}

function canPremove(data, orig, dest) {
  return orig !== dest &&
    isPremovable(data, orig) &&
    util.containsX(premove(data.pieces, orig), dest);
}

function isDraggable(data, orig) {
  var piece = data.pieces[orig];
  return piece && data.draggable.enabled && (
    data.movable.color === 'both' || (
      data.movable.color === piece.color && (
        data.turnColor === piece.color || data.premovable.enabled
      )
    )
  );
}

function playPremove(data) {
  var move = data.premovable.current;
  if (move) {
    var orig = move[0],
      dest = move[1];
    if (canMove(data, orig, dest)) {
      if (baseMove(data, orig, dest)) {
        callUserFunction(partial(data.movable.events.after, orig, dest));
      }
    }
    data.premovable.current = null;
  }
}

function getKeyAtDomPos(data, pos, bounds) {
  if (!bounds && !data.bounds) return;
  bounds = bounds || data.bounds(); // use provided value, or compute it
  var file = Math.ceil(8 * ((pos[0] - bounds.left) / bounds.width));
  file = data.orientation === 'white' ? file : 9 - file;
  var rank = Math.ceil(8 - (8 * ((pos[1] - bounds.top) / bounds.height)));
  rank = data.orientation === 'white' ? rank : 9 - rank;
  if (file > 0 && file < 9 && rank > 0 && rank < 9) return util.pos2key([file, rank]);
}

module.exports = {
  toggleOrientation: toggleOrientation,
  setPieces: setPieces,
  selectSquare: selectSquare,
  setSelected: setSelected,
  isDraggable: isDraggable,
  canMove: canMove,
  userMove: userMove,
  apiMove: apiMove,
  playPremove: playPremove,
  getKeyAtDomPos: getKeyAtDomPos
};
