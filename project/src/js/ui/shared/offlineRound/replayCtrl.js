import { Chess } from 'chess.js';
import { gameResult } from '.';
import settings from '../../../settings';
import session from '../../../session';
import work from 'webworkify';

export default function replayCtrl(root, rootSituations, rootPly) {

  this.root = root;
  this.ply = 0;
  this.situations = [];
  this.hash = '';

  var chessWorker = work(require('./chessWorker'));
  chessWorker.onmessage = function(e) {
    this.ply++;
    if (this.ply <= this.situations.length)
      this.situations = this.situations.slice(0, this.ply);
    this.situations.push(e.data);
    this.apply();
    root.onReplayAdded();
  }.bind(this);

  this.init = function(situations, ply) {
    if (situations) this.situations = situations;
    else {
      var chess = new Chess(this.root.data.game.initialFen, 0);
      this.situations = [{
        fen: this.root.data.game.initialFen,
        turnColor: this.root.data.game.player,
        movable: {
          color: this.root.data.game.player,
          dests: chess.dests()
        },
        check: false,
        lastMove: null,
        san: null,
        ply: 0
      }];
    }
    this.ply = ply || 0;
  }.bind(this);

  this.init(rootSituations, rootPly);

  this.situation = function() {
    return this.situations[this.ply];
  }.bind(this);

  this.apply = function() {
    this.root.chessground.set(this.situation());
  }.bind(this);

  this.addMove = function(orig, dest, promotion) {
    chessWorker.postMessage({
      ply: this.ply + 1,
      fen: this.situation().fen,
      promotion,
      orig,
      dest
    });
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
    // display players in ai games only
    if (this.root.getOpponent) {
      const playerIsWhite = this.root.data.player.color === 'white';
      const opponent = settings.ai.availableOpponents.find(el => el[1] === settings.ai.opponent());
      const player = session.get() ? session.get().username : 'Anonymous';
      const ai = opponent[0] + ' (Garbochess level ' + opponent[1] + ')';
      chess.header('White', playerIsWhite ? player : ai);
      chess.header('Black', playerIsWhite ? ai : player);
    }
    chess.header('Result', gameResult(this));
    chess.header('Variant', 'Standard');
    return chess.pgn({
      max_width: 30
    });
  }.bind(this);
}
