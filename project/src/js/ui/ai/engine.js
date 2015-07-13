import garbo from '../../garbochess/garbochess';

// [time, plies]
var levels = {
  1: [20, 1],
  2: [40, 2],
  3: [70, 3],
  4: [120, 4],
  5: [300, 6],
  6: [600, 8],
  7: [1000, 12],
  8: [2000, 20]
};

var level = 1;

var forsyth = function(role) {
  return role === 'knight' ? 'n' : role[0];
};

export default {
  init: function(fen) {
    garbo.reset();
    garbo.setFen(fen);
  },
  setLevel: function(l) {
    level = l;
    garbo.setMoveTime(levels[level][0]);
  },
  addMove: function(origKey, destKey, promotionRole) {
    var move = origKey + destKey + (promotionRole ? forsyth(promotionRole) : '');
    garbo.addMove(garbo.getMoveFromString(move));
  },
  search: function(then) {
    garbo.search(function(bestMove) {
      if (bestMove === 0) return;
      var str = garbo.formatMove(bestMove);
      var move = [str.slice(0, 2), str.slice(2, 4), str[4]];
      then(move);
    }, levels[level][1], null);
  },
  getFen: garbo.getFen
};
