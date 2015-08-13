import { Chess } from 'chess.js';

export default function replayCtrl(root, rootSituations, rootPly) {

  this.root = root;
  this.ply = 0;
  this.situations = [];
  this.hash = '';

  this.init = function(initSituations, initPly) {
    if (initSituations) this.situations = initSituations;
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
        lastMove: null,
        san: null,
        ply: 0
      }];
    }
    this.ply = initPly || 0;
  }.bind(this);
  this.init(rootSituations, rootPly);

  this.situation = function() {
    return this.situations[this.ply];
  }.bind(this);

  this.apply = function() {
    this.root.chessground.set(this.situation());
  }.bind(this);

  var forsyth = function(role) {
    return role === 'knight' ? 'n' : role[0];
  };

  this.addMove = function(orig, dest, promotion) {
    const situation = this.situation();
    const chess = new Chess(situation.fen, 0);
    const promotionLetter = (dest[1] === '1' || dest[1] === '8') ?
      (promotion ? forsyth(promotion) : 'q') : null;
    const move = chess.move({
      from: orig,
      to: dest,
      promotion: promotionLetter
    });
    this.ply++;
    const turnColor = chess.turn() === 'w' ? 'white' : 'black';
    if (this.ply <= this.situations.length)
      this.situations = this.situations.slice(0, this.ply);
    this.situations.push({
      fen: chess.fen(),
      turnColor: turnColor,
      movable: {
        dests: chess.dests()
      },
      check: chess.in_check(),
      finished: chess.game_over(),
      checkmate: chess.in_checkmate(),
      stalemate: chess.in_stalemate(),
      threefold: chess.in_threefold_repetition(),
      draw: chess.in_draw(),
      lastMove: [move.from, move.to],
      san: move.san,
      ply: this.ply,
      promotion: promotionLetter
    });
    this.apply();
  };

  this.situationsHash = function(steps) {
    let h = '';
    for (let i in steps) {
      h += steps[i].san;
    }
    return h;
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
}
