import util from './util';

// https://gist.github.com/gre/1650294
var easing = {
  easeInOutCubic: function(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
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
  var bounds = current.bounds,
    width = bounds.width / 8,
    height = bounds.height / 8,
    anims = {},
    animedOrigs = [],
    capturedPieces = {},
    missings = [],
    news = [],
    invert = prev.orientation !== current.orientation,
    prePieces = {},
    white = current.orientation === 'white';
  var pKs = Object.keys(prev.pieces), pk;
  for (var j = 0, jlen = pKs.length; j < jlen; j++) {
    pk = pKs[j];
    var piece = makePiece(pk, prev.pieces[pk], invert);
    prePieces[piece.key] = piece;
  }
  for (var i = 0, ilen = util.allKeys.length; i < ilen; i++) {
    var key = util.allKeys[i];
    if (key !== current.movable.dropped[1]) {
      var curP = current.pieces[key];
      var preP = prePieces[key];
      if (curP) {
        if (preP) {
          if (!samePiece(curP, preP)) {
            missings.push(preP);
            news.push(makePiece(key, curP, false));
          }
        } else
          news.push(makePiece(key, curP, false));
      } else if (preP)
        missings.push(preP);
    }
  }
  news.forEach(function(newP) {
    var nPreP = closer(newP, missings.filter(function(p) { return samePiece(newP, p); }));
    if (nPreP) {
      var orig = white ? nPreP.pos : newP.pos;
      var dest = white ? newP.pos : nPreP.pos;
      var vector = [(orig[0] - dest[0]) * width, (dest[1] - orig[1]) * height];
      anims[newP.key] = [vector, vector];
      animedOrigs.push(nPreP.key);
    }
  });
  missings.forEach(function(p) {
    if (p.key !== current.movable.dropped[0] && !util.containsX(animedOrigs, p.key)) {
      capturedPieces[p.key] = p;
    }
  });

  return {
    anims: anims,
    capturedPieces: capturedPieces
  };
}

function roundBy(n, by) {
  return Math.round(n * by) / by;
}

function step(data) {
  // animation was canceled
  if (!data.animation.current.start) return;
  var rest = 1 - (Date.now() - data.animation.current.start) / data.animation.current.duration;
  if (rest <= 0) {
    data.animation.current = {};
    data.render();
  } else {
    var ease = easing.easeInOutCubic(rest);
    var anims = data.animation.current.anims;
    var animsK = Object.keys(anims);
    for (var i = 0, len = animsK.length; i < len; i++) {
      var key = animsK[i];
      var cfg = anims[key];
      cfg[1] = [roundBy(cfg[0][0] * ease, 10), roundBy(cfg[0][1] * ease, 10)];
    }
    data.render();
    data.batchRAF(function() { return step(data); });
  }
}

function animate(transformation, data) {
  // clone data
  var prev = {
    orientation: data.orientation,
    pieces: {}
  };
  // clone pieces
  var pKs = Object.keys(data.pieces), key;
  for (var i = 0, len = pKs.length; i < len; i++) {
    key = pKs[i];
    prev.pieces[key] = {
      role: data.pieces[key].role,
      color: data.pieces[key].color
    };
  }
  var result = transformation();
  var plan = computePlan(prev, data);
  if (Object.keys(plan.anims).length > 0 || Object.keys(plan.capturedPieces).length > 0) {
    var alreadyRunning = data.animation.current.start;
    data.animation.current = {
      start: Date.now(),
      duration: data.animation.duration,
      anims: plan.anims,
      capturedPieces: plan.capturedPieces,
      animating: {}
    };
    if (!alreadyRunning) data.batchRAF(function() { return step(data); });
  } else {
    data.renderRAF();
  }
  return result;
}

// transformation is a function
// accepts board data and any number of arguments,
// and mutates the board.
export default function anim(transformation, data, skip) {
  return function() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; ++i) {
      args[i] = arguments[i];
    }
    const transformationArgs = [data].concat(args);
    if (!data.render) return transformation.apply(null, transformationArgs);
    else if (data.animation.enabled && !skip)
      return animate(() => transformation.apply(null, transformationArgs), data);
    else {
      const result = transformation.apply(null, transformationArgs);
      data.renderRAF();
      return result;
    }
  };
}
