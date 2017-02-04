var files = 'abcdefgh'.split('');
var invFiles = files.slice().reverse();
var ranks = [1, 2, 3, 4, 5, 6, 7, 8];
var invRanks = [8, 7, 6, 5, 4, 3, 2, 1];
var fileNumbers = {
  a: 1,
  b: 2,
  c: 3,
  d: 4,
  e: 5,
  f: 6,
  g: 7,
  h: 8
};
var rankNumbers = {
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8
};

function pos2key(pos) {
  return files[pos[0] - 1] + pos[1];
}

function key2pos(key) {
  return [fileNumbers[key[0]], rankNumbers[key[1]]];
}

function boardpos(pos, asWhite) {
  return {
    left: (asWhite ? pos[0] - 1 : 8 - pos[0]) * 12.5,
    bottom: (asWhite ? pos[1] - 1 : 8 - pos[1]) * 12.5
  };
}

function posToTranslate(pos, asWhite, bounds) {
  return [
    (asWhite ? pos[0] - 1 : 8 - pos[0]) * bounds.width / 8, (asWhite ? 8 - pos[1] : pos[1] - 1) * bounds.height / 8
  ];
}

function invertKey(key) {
  return files[8 - fileNumbers[key[0]]] + (9 - rankNumbers[key[1]]);
}

var allPos = (function() {
  var ps = [];
  invRanks.forEach(function(y) {
    ranks.forEach(function(x) {
      ps.push([x, y]);
    });
  });
  return ps;
})();
var allKeys = allPos.map(pos2key);
var invKeys = allKeys.slice(0).reverse();

function classSet(classes) {
  var c = '';
  var keys = Object.keys(classes);
  for (var i = 0, len = keys.length; i < len; i++) {
    if (classes[keys[i]]) c += ' ' + keys[i];
  }
  return c;
}

function opposite(color) {
  return color === 'white' ? 'black' : 'white';
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

function translate(pos) {
  return 'translate(' + pos[0] + 'px,' + pos[1] + 'px)';
}

function translate3d(pos) {
  return 'translate3d(' + pos[0] + 'px,' + pos[1] + 'px, 0)';
}

function eventPosition(e) {
  return [e.targetTouches[0].clientX, e.targetTouches[0].clientY];
}

function isRightButton(e) {
  return e.buttons === 2 || e.button === 2;
}

function computeSquareBounds(orientation, bounds, key) {
  var pos = key2pos(key);
  if (orientation !== 'white') {
    pos[0] = 9 - pos[0];
    pos[1] = 9 - pos[1];
  }
  return {
    left: bounds.left + bounds.width * (pos[0] - 1) / 8,
    top: bounds.top + bounds.height * (8 - pos[1]) / 8,
    width: bounds.width / 8,
    height: bounds.height / 8
  };
}

export default {
  files,
  invFiles,
  ranks: ranks,
  invRanks: invRanks,
  allPos: allPos,
  allKeys: allKeys,
  invKeys: invKeys,
  pos2key: pos2key,
  key2pos: key2pos,
  posToTranslate: posToTranslate,
  boardpos: boardpos,
  invertKey: invertKey,
  classSet: classSet,
  opposite: opposite,
  translate: translate,
  translate3d: translate3d,
  contains2: contains2,
  containsX: containsX,
  distance: distance,
  eventPosition: eventPosition,
  isRightButton: isRightButton,
  computeSquareBounds: computeSquareBounds
};
