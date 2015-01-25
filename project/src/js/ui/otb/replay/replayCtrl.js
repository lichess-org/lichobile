var Chess = require('chessli.js').Chess;
var game = require('../../round/game');

module.exports = function(root, situations, ply) {

  this.root = root;

  var gameVariants = {
    'chess960': 1,
    'antichess': 2,
    'atomic': 3
  };
  var chessVariant = gameVariants[root.data.game.variant.key] || 0;

  this.init = function(situations, ply) {
    if (situations) this.situations = situations;
    else {
      var chess = new Chess(root.data.game.initialFen, chessVariant);
      this.situations = [{
        fen: root.data.game.initialFen,
        turnColor: root.data.game.player,
        movable: {
          color: root.data.game.player,
          dests: chess.dests()
        },
        check: false,
        lastMove: null
      }];
    }
    this.ply = ply || 0;
  };
  this.init(situations, ply);

  this.apply = function() {
    root.chessground.set(this.situations[this.ply]);
  }.bind(this);

  this.jump = function(ply) {
    if (this.ply === ply || ply < 0 || ply >= this.situations.length) return;
    this.ply = ply;
    this.apply();
  }.bind(this);

  var forsyth = function(role) {
    return role === 'knight' ? 'n' : role[0];
  };

  this.addMove = function(orig, dest, promotion) {
    var situation = this.situations[this.ply];
    var chess = new Chess(situation.fen, chessVariant);
    var move = chess.move({
      from: orig,
      to: dest,
      promotion: (dest[1] == 1 || dest[1] == 8) ? (promotion ? forsyth(promotion) : 'q') : null
    });
    this.ply++;
    var turnColor = chess.turn() === 'w' ? 'white' : 'black';
    if (this.ply <= this.situations.length)
      this.situations = this.situations.slice(0, this.ply);
    this.situations.push({
      fen: chess.fen(),
      turnColor: turnColor,
      movable: {
        color: turnColor,
        dests: chess.dests()
      },
      check: chess.in_check(),
      lastMove: [move.from, move.to]
    });
    this.apply();
  };
};
