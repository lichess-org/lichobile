var garbo = require('./garbochess');

var levelMoveTime = {
  1: 20,
  2: 50,
  3: 100,
  4: 200,
  5: 500,
  6: 1000,
  7: 2000,
  8: 4000
};

module.exports = {
  init: function(fen) {
    garbo.reset();
    garbo.setFen(fen);
  },
  setLevel: function(level) {
    garbo.setMoveTime(levelMoveTime[level] || 300);
  },
  addMove: function(origKey, destKey, promotionRole) {
    var move = origKey + destKey + (promotionRole ? promotionRole[0] : '');
    garbo.addMove(garbo.getMoveFromString(move));
  },
  search: function(then) {
    garbo.search(function(bestMove, value, timeTaken, ply) {
      var str = garbo.formatMove(bestMove);
      var move = [str.slice(0, 2), str.slice(2, 4), str[4]];
      then(move);
    }, 99, null);
  },
  getFen: garbo.getFen
};
