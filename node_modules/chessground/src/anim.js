var forIn = require('lodash-node/modern/objects/forIn')
var clone = require('lodash-node/modern/objects/clone')
var m = require('mithril');
var util = require('./util');

function makePiece(k, piece, invert) {
  var key = invert ? util.invertKey(k) : k;
  return {
    key: key,
    pos: util.key2pos(key),
    role: piece.role,
    color: piece.color
  };
}

function samePiece(p1, p2) {
  return p1.role === p2.role && p1.color === p2.color;
}

function distance(p1, p2) {
  return Math.sqrt(Math.pow(p1.pos[0] - p2.pos[0], 2) + Math.pow(p1.pos[1] - p2.pos[1], 2));
}

function closer(piece, pieces) {
  return pieces.sort(function(p1, p2) {
    return distance(piece, p1) - distance(piece, p2);
  })[0];
}

function compute(prev, current) {
  var size = current.bounds().width / 8,
    anims = {},
    missings = [],
    news = [],
    invert = prev.orientation !== current.orientation,
    prePieces = {};
  util.allKeys.forEach(function(k) {
    if (prev.pieces[k]) {
      var piece = makePiece(k, prev.pieces[k], invert);
      prePieces[piece.key] = piece;
    }
  });
  util.allKeys.forEach(function(k) {
    if (k !== current.movable.dropped) {
      var curP = current.pieces.get(k);
      var preP = prePieces[k];
      if (curP) {
        if (preP) {
          if (!samePiece(curP, preP)) {
            missings.push(preP);
            news.push(makePiece(k, curP, false));
          }
        } else
          news.push(makePiece(k, curP, false));
      } else if (preP)
        missings.push(preP);
    }
  });
  news.forEach(function(newP) {
    var preP = closer(newP, missings.filter(samePiece.bind(null, newP)));
    if (preP) {
      var orig = current.orientation === 'white' ? preP.pos : newP.pos;
      var dest = current.orientation === 'white' ? newP.pos : preP.pos;
      var vector = [(orig[0] - dest[0]) * size, (dest[1] - orig[1]) * size];
      anims[newP.key] = [vector, vector];
    }
  });
  return anims;
}

function go(render) {
  var self = this;
  var rest = 1 - (new Date().getTime() - self.current.start) / self.current.duration;
  try {
    if (rest <= 0) {
      self.current = {};
      render();
    } else {
      forIn(self.current.anims, function(cfg, key) {
        self.current.anims[key][1] = [cfg[0][0] * rest, cfg[0][1] * rest];
      });
      render();
      requestAnimationFrame(go.bind(self, render));
    }
  } catch (e) {
    // breaks if the DOM node was removed. Who cares.
  }
}

function animate(current, transformation) {
  var prev = {
    orientation: current.orientation,
    pieces: clone(current.pieces.all, true)
  };
  var result = transformation();
  var anims = compute(prev, current);
  if (Object.getOwnPropertyNames(anims).length > 0) {
    current.animation.current = {
      start: new Date().getTime(),
      duration: current.animation.duration,
      anims: anims
    };
    go.call(current.animation, current.render);
  }
  return result;
}

// transformation is a function
// that assumes board data as this,
// accepts any number of arguments,
// and mutates the board.
module.exports = function(board, transformation) {
  return function() {
    if (board.animation.enabled && !board.animation.current.start && board.render)
      return animate(board, transformation.apply.bind(transformation, board, arguments));
    else
      return transformation.apply(board, arguments);
  };
};
