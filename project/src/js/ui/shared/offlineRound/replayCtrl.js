import { Chess } from 'chess.js';
import { gameResult } from '.';
import { askWorker } from '../../../utils';
import settings from '../../../settings';
import session from '../../../session';

export default function replayCtrl(root, rootSituations, rootPly, chessWorker) {

  this.root = root;
  this.ply = 0;
  this.situations = [];
  this.hash = '';

  const worker = chessWorker || new Worker('vendor/scalachessjs.js');
  worker.addEventListener('message', function(msg) {
    if (msg.data.topic === 'error') {
      console.error(msg.data);
    }
    else if (msg.data.topic === 'pgnMove') {
      console.log(msg.data.payload);
      this.ply++;
      if (this.ply <= this.situations.length)
        this.situations = this.situations.slice(0, this.ply);
      this.situations.push(msg.data.payload.situation);
      this.apply();
      root.onReplayAdded();
    }
  }.bind(this));

  this.init = function(situations, ply) {
    if (situations) this.situations = situations;
    else {
      askWorker(worker, {
        topic: 'dests',
        payload: {
          variant: this.root.data.game.variant.key,
          fen: this.root.data.game.initialFen
        }
      }, function(data) {
        this.situations = [{
          fen: this.root.data.game.initialFen,
          player: this.root.data.game.player,
          dests: data.dests,
          check: false,
          lastMove: null,
          san: null,
          ply: 0
        }];
        this.apply();
      }.bind(this));
    }
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
    worker.postMessage({
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

  this.onunload = function() {
    if (worker) worker.terminate();
  };
}
