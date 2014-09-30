var forIn = require('lodash-node/modern/objects/forIn');
var m = require('mithril');
var util = require('./util');

// https://gist.github.com/gre/1650294
var easing = {
  easeInOutQuad: function(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },
  easeInOutCubic: function(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  },
  easeOutQuad: function(t) {
    return t * (2 - t);
  },
  easeOutCubic: function(t) {
    return (--t) * t * t + 1;
  }
};

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

function closer(piece, pieces) {
  return pieces.sort(function(p1, p2) {
    return util.distance(piece.pos, p1.pos) - util.distance(piece.pos, p2.pos);
  })[0];
}

function computePlan(prev, current) {
  var size = current.bounds().width / 8,
    anims = {},
    animedOrigs = [],
    fadings = [],
    missings = [],
    news = [],
    invert = prev.orientation !== current.orientation,
    prePieces = {},
    white = current.orientation === 'white';
  util.allKeys.forEach(function(k) {
    if (prev.pieces[k]) {
      var piece = makePiece(k, prev.pieces[k], invert);
      prePieces[piece.key] = piece;
    }
  });
  util.allKeys.forEach(function(k) {
    if (k !== current.movable.dropped[1]) {
      var curP = current.pieces[k];
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
    var preP = closer(newP, missings.filter(util.partial(samePiece, newP)));
    if (preP) {
      var orig = white ? preP.pos : newP.pos;
      var dest = white ? newP.pos : preP.pos;
      var vector = [(orig[0] - dest[0]) * size, (dest[1] - orig[1]) * size];
      anims[newP.key] = [vector, vector];
      animedOrigs.push(preP.key);
    }
  });
  missings.forEach(function(p) {
    if (p.key !== current.movable.dropped[0] && !util.containsX(animedOrigs, p.key)) {
      fadings.push({
        role: p.role,
        color: p.color,
        size: size + 'px',
        pos: [
          (white ? (p.pos[0] - 1) : (8 - p.pos[0])) * size, (white ? (1 - p.pos[1]) : (-8 + p.pos[1])) * size
        ],
        opacity: 1
      });
    }
  });

  return {
    anims: anims,
    fadings: fadings
  };
}

function go(data) {
  if (!data.animation.current.start) return; // animation was canceled
  var rest = 1 - (new Date().getTime() - data.animation.current.start) / data.animation.current.duration;
  if (rest <= 0) {
    data.animation.current = {};
    data.render();
  } else {
    var ease = easing.easeInOutCubic(rest);
    forIn(data.animation.current.anims, function(cfg, key) {
      data.animation.current.anims[key][1] = [cfg[0][0] * ease, cfg[0][1] * ease];
    });
    for (var i in data.animation.current.fadings) {
      data.animation.current.fadings[i].opacity = easing.easeOutQuad(rest);
    }
    data.render();
    requestAnimationFrame(function() {
      go(data);
    });
  }
}

function animate(transformation, data) {
  // clone data
  var prev = {
    orientation: data.orientation,
    pieces: {}
  };
  // clone pieces
  for (var key in data.pieces) {
    prev.pieces[key] = {
      role: data.pieces[key].role,
      color: data.pieces[key].color
    };
  }
  var result = transformation();
  var plan = computePlan(prev, data);
  if (Object.getOwnPropertyNames(plan.anims).length > 0 || plan.fadings.length > 0) {
    var alreadyRunning = data.animation.current.start;
    data.animation.current = {
      start: new Date().getTime(),
      duration: data.animation.duration,
      anims: plan.anims,
      fadings: plan.fadings
    };
    if (!alreadyRunning) go(data);
  } else {
    // don't animate, just render right away
    data.renderRAF();
  }
  return result;
}

// transformation is a function
// accepts board data and any number of arguments,
// and mutates the board.
module.exports = function(transformation, data, skip) {
  return function() {
    var transformationArgs = [data].concat(Array.prototype.slice.call(arguments, 0));
    if (data.animation.enabled && !skip && data.render)
      return animate(util.partialApply(transformation, transformationArgs), data);
    else {
      var result = transformation.apply(null, transformationArgs);
      data.renderRAF();
      return result;
    }
  };
};
