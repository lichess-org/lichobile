var Chess = require('chessli.js').Chess;
var game = require('../../round/game');

module.exports = function(root, situations, ply) {

  this.root = root;

  var gameVariants = {
    'chess960': 1,
    'antichess': 2,
    'atomic': 3
  };
  var chessVariant = gameVariants[this.root.data.game.variant.key] || 0;

  this.init = function(situations, ply) {
    if (situations) this.situations = situations;
    else {
      var chess = new Chess(this.root.data.game.initialFen, chessVariant);
      this.situations = [{
        fen: this.root.data.game.initialFen,
        turnColor: this.root.data.game.player,
        movable: {
          color: this.root.data.game.player,
          dests: chess.dests()
        },
        check: false,
        lastMove: null
      }];
    }
    this.ply = ply || 0;
  }.bind(this);
  this.init(situations, ply);

  this.situation = function() {
    return this.situations[this.ply];
  }.bind(this);

  this.apply = function() {
    this.root.chessground.set(this.situation());
  }.bind(this);

  this.jump = function(ply) {
    this.root.chessground.cancelMove();
    if (this.ply === ply || ply < 0 || ply >= this.situations.length) return;
    this.ply = ply;
    this.apply();
  }.bind(this);

  var forsyth = function(role) {
    return role === 'knight' ? 'n' : role[0];
  };

  this.addMove = function(orig, dest, promotion) {
    var situation = this.situation();
    var chess = new Chess(situation.fen, chessVariant);
    var promotionLetter = (dest[1] == 1 || dest[1] == 8) ? (promotion ? forsyth(promotion) : 'q') : null;
    var move = chess.move({
      from: orig,
      to: dest,
      promotion: promotionLetter
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
      checkmate: chess.in_checkmate(),
      lastMove: [move.from, move.to],
      promotion: promotionLetter
    });
    this.apply();
  };

  this.pgn = function() {
    var chess = new Chess(this.root.data.game.initialFen, chessVariant);
    this.situations.forEach(function(sit) {
      if (sit.lastMove) chess.move({
        from: sit.lastMove[0],
        to: sit.lastMove[1],
        promotion: sit.promotion
      });
    });
    chess.header('Event', 'Casual game');
    chess.header('Site', 'http://lichess.org');
    chess.header('Date', moment().format('YYYY.MM.DD'));
    // chess.header('Result', game.result(this.root.data));
    chess.header('Variant', 'Standard');
    return chess.pgn({
      max_width: 30,
      newline_char: '<br />'
    });
  }.bind(this);
};
