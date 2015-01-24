var Chess = require('chessli.js').Chess;
var game = require('../game');
var xhr = require('../roundXhr');

module.exports = function(root) {

  this.root = root;
  this.active = false;
  this.broken = false;
  this.ply = 0;

  var situationCache = {};

  var gameVariants = {
    'chess960' : 1,
    'antichess': 2,
    'atomic': 3
  };

  var showFen = function() {
    try {
      var ply, move, cached, fen, lm, h = '', hash = '';
      for (ply = 1; ply <= this.ply; ply++) {
        move = root.data.game.moves[ply - 1];
        h += move;
        cached = situationCache[h];
        if (!cached) break;
        hash = h;
        fen = cached.fen;
      }
      if (!cached || ply < this.ply) {
        var chess = new Chess(
          fen || root.data.game.initialFen,
          gameVariants[root.data.game.variant.key] || 0
        );
        for (ply = ply; ply <= this.ply; ply++) {
          move = root.data.game.moves[ply - 1];
          hash += move;
          lm = chess.move(move);
          situationCache[hash] = {
            fen: chess.fen(),
            check: chess.in_check(),
            lastMove: [lm.from, lm.to],
            turnColor: ply % 2 === 0 ? 'white' : 'black'
          };
        }
      }
      root.chessground.set(situationCache[hash]);
    } catch (e) {
      console.log(e);
      onBreak();
    }
  }.bind(this);

  var enable = function() {
    root.chessground.stop();
  }.bind(this);

  var disable = function() {
    root.chessground.set({
      movable: {
        color: game.isPlayerPlaying(root.data) ? root.data.player.color : null,
        dests: game.parsePossibleMoves(root.data.possibleMoves)
      }
    });
  }.bind(this);

  var onBreak = function() {
    disable();
    this.active = false;
    this.broken = true;
    xhr.reload(root).then(root.reload);
  }.bind(this);

  this.onReload = function(cfg) {
    if (this.active && cfg.game.moves !== root.data.game.moves.join(' ')) this.active = false;
  }.bind(this);

  this.jump = function(ply) {
    if (this.broken) return;
    if (this.ply === ply || ply < 1 || ply > root.data.game.moves.length) return;
    this.active = ply !== root.data.game.moves.length;
    this.ply = ply;
    if (this.active) enable();
    else disable();
    showFen();
  }.bind(this);
};
