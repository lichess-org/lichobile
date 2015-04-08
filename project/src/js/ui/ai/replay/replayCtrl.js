var Chess = require('chessli.js').Chess;
var engine = require('../engine');

module.exports = function(root, situations, ply) {

  this.root = root;

  this.init = function(situations, ply) {
    if (situations) this.situations = situations;
    else {
      var chess = new Chess(this.root.data.game.initialFen, 0);
      this.situations = [{
        fen: this.root.data.game.initialFen,
        turnColor: this.root.data.game.player,
        movable: {
          color: this.root.data.player.color,
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
    if (this.situation() && this.situation().turnColor !== this.root.data.player.color) ply++;
    if (this.ply === ply || ply < 0 || ply >= this.situations.length) return;
    this.ply = ply;
    this.apply();
    engine.init(this.situation().fen);
  }.bind(this);

  var forsyth = function(role) {
    return role === 'knight' ? 'n' : role[0];
  };

  this.addMove = function(orig, dest, promotion) {
    var situation = this.situation();
    var chess = new Chess(situation.fen, 0);
    var promotionLetter = (dest[1] === '1' || dest[1] === '8') ?
      (promotion ? forsyth(promotion) : 'q') : null;
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
    var chess = new Chess(this.root.data.game.initialFen, 0);
    this.situations.forEach(function(sit) {
      if (sit.lastMove) chess.move({
        from: sit.lastMove[0],
        to: sit.lastMove[1],
        promotion: sit.promotion
      });
    });
    chess.header('Event', 'Casual game');
    chess.header('Site', 'http://lichess.org');
    chess.header('Date', window.moment().format('YYYY.MM.DD'));
    // chess.header('Result', game.result(this.root.data));
    chess.header('Variant', 'Standard');
    return chess.pgn({
      max_width: 30
    });
  }.bind(this);
};
