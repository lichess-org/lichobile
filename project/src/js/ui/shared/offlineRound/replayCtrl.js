import { Chess } from 'chess.js';
import { gameResult } from '.';
import settings from '../../../settings';
import session from '../../../session';

export default function replayCtrl(root, rootSituations, rootPly, chessWorker) {

  this.root = root;
  this.ply = 0;
  this.situations = [];
  this.hash = '';

  chessWorker.addEventListener('message', function(msg) {
    switch (msg.data.topic) {
      case 'error':
        console.error(msg.data);
        break;
      case 'pgnMove':
        console.log(msg.data.payload);
        this.ply++;
        if (this.ply <= this.situations.length) {
          this.situations = this.situations.slice(0, this.ply);
        }
        this.situations.push(msg.data.payload.situation);
        this.apply();
        root.onReplayAdded();
        break;
    }
  }.bind(this));

  this.init = function(situations, ply) {
    this.situations = situations;
    this.ply = ply || 0;
  }.bind(this);

  this.init(rootSituations, rootPly);

  this.situation = function() {
    return this.situations[this.ply];
  }.bind(this);

  this.apply = function() {
    const sit = this.situation();
    if (sit) {
      // TODO remove this in future version
      // it's here for BC compat only
      if (sit.movable) {
        this.root.chessground.set(sit);
      } else {
        this.root.chessground.set({
          fen: sit.fen,
          turnColor: sit.player,
          lastMove: sit.lastMove ? [sit.lastMove.from, sit.lastMove.to] : null,
          movable: {
            dests: sit.dests,
            color: sit.player
          },
          check: sit.check
        });
      }
    }
  }.bind(this);

  this.addMove = function(orig, dest, promotion) {
    chessWorker.postMessage({
      topic: 'pgnMove',
      payload: {
        variant: this.root.data.game.variant.key,
        fen: this.situation().fen,
        pgnMoves: this.situation().pgnMoves || [],
        promotion,
        orig,
        dest
      }
    });
  }.bind(this);

  this.situationsHash = function(sits) {
    let h = '';
    for (let i in sits) {
      h += sits[i].uci;
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
