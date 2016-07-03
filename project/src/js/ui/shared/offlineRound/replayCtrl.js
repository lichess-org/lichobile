import i18n from '../../../i18n';
import { setResult } from '.';
import { askWorker } from '../../../utils';

export default function replayCtrl(root, rootSituations, rootPly, chessWorker) {

  this.root = root;
  this.ply = 0;
  this.situations = [];
  this.hash = '';

  chessWorker.addEventListener('message', function(msg) {
    const payload = msg.data.payload;
    switch (msg.data.topic) {
      case 'error':
        console.error(msg.data);
        break;
      case 'move':
      case 'drop':
        this.ply++;
        if (this.ply < this.situations.length) {
          this.situations = this.situations.slice(0, this.ply);
        }
        this.situations.push(payload.situation);
        this.apply();
        root.onReplayAdded();
        break;
      case 'threefoldTest':
        if (payload.threefoldRepetition) {
          setResult(root, payload.status);
          root.save();
          root.onGameEnd();
        } else {
          window.plugins.toast.show(i18n('incorrectThreefoldClaim'), 'short', 'center');
        }
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
      const lastUci = sit.uciMoves.length ? sit.uciMoves[sit.uciMoves.length - 1] : null;
      this.root.chessground.set({
        fen: sit.fen,
        turnColor: sit.player,
        lastMove: lastUci ? [lastUci.slice(0, 2), lastUci.slice(2, 4)] : null,
        movable: {
          dests: sit.dests,
          color: sit.player
        },
        check: sit.check
      });
    }
  }.bind(this);

  this.addMove = function(orig, dest, promotion) {
    const sit = this.situation();
    chessWorker.postMessage({
      topic: 'move',
      payload: {
        variant: this.root.data.game.variant.key,
        fen: sit.fen,
        pgnMoves: sit.pgnMoves,
        uciMoves: sit.uciMoves,
        promotion,
        orig,
        dest
      }
    });
  }.bind(this);

  this.addDrop = function(role, key) {
    const sit = this.situation();
    chessWorker.postMessage({
      topic: 'drop',
      payload: {
        variant: this.root.data.game.variant.key,
        fen: sit.fen,
        pgnMoves: sit.pgnMoves,
        uciMoves: sit.uciMoves,
        role,
        pos: key
      }
    });
  }.bind(this);

  this.claimDraw = function() {
    const sit = this.situation();
    chessWorker.postMessage({
      topic: 'threefoldTest',
      payload: {
        variant: this.root.data.game.variant.key,
        initialFen: this.root.data.game.initialFen,
        pgnMoves: sit.pgnMoves
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
    const sit = this.situation();
    return askWorker(chessWorker, {
      topic: 'pgnDump',
      payload: {
        variant: this.root.data.game.variant.key,
        initialFen: this.root.data.game.initialFen,
        pgnMoves: sit.pgnMoves
      }
    });
  }.bind(this);
}
