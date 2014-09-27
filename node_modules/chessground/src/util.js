var partial = require('lodash-node/modern/functions/partial');
var range = require('lodash-node/modern/arrays/range');

var files = "abcdefgh".split('');
var ranks = range(1, 9);

function pos2key(pos) {
  return files[pos[0] - 1] + pos[1];
}

function key2pos(pos) {
  return [(files.indexOf(pos[0]) + 1), parseInt(pos[1])];
}

function invertKey(key) {
  return files[7 - files.indexOf(key[0])] + (9 - parseInt(key[1]));
}

var allPos = (function() {
  var ps = [];
  ranks.forEach(function(y) {
    ranks.forEach(function(x) {
      ps.push([x, y]);
    });
  });
  return ps;
})();
var allKeys = allPos.map(pos2key);

function classSet(classNames) {
  return Object.keys(classNames).filter(function(className) {
    return classNames[className];
  }).join(' ');
}

function opposite(color) {
  return color === 'white' ? 'black' : 'white';
}

function translate(pos) {
  return 'translate3d(' + pos[0] + 'px,' + pos[1] + 'px,0)';
}

function contains2(xs, x) {
  return xs && (xs[0] === x || xs[1] === x);
}

function containsX(xs, x) {
  return xs && xs.indexOf(x) !== -1;
}

function distance(pos1, pos2) {
  return Math.sqrt(Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2));
}

function pp(x) {
  console.log(x);
  return x;
}

function isTouchDevice() {
  return 'ontouchstart' in window || // works on most browsers
    'onmsgesturechange' in window; // works on ie10
}

function eventPosition(e) {
  return e.touches ? [e.touches[0].clientX, e.touches[0].clientY] : [e.clientX, e.clientY];
}

function partialApply(fn, args) {
  return partial.apply(null, [fn].concat(args));
}

module.exports = {
  files: files,
  ranks: ranks,
  allPos: allPos,
  allKeys: allKeys,
  pos2key: pos2key,
  key2pos: key2pos,
  invertKey: invertKey,
  classSet: classSet,
  opposite: opposite,
  translate: translate,
  contains2: contains2,
  containsX: containsX,
  distance: distance,
  isTouchDevice: isTouchDevice,
  eventPosition: eventPosition,
  partialApply: partialApply,
  pp: pp
};
