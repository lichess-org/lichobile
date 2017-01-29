import { last } from 'lodash/array';
import chessground from '../../chessground';
import router from '../../router';
import redraw from '../../utils/redraw';
import signals from '../../signals';
import { handleXhrError } from '../../utils';
import { batchRequestAnimationFrame } from '../../utils/batchRAF';
import makeData from './data';
import chess from './chess';
import puzzle from './puzzle';
import sound from '../../sound';
import settings from '../../settings';
import menu from './menu';
import * as xhr from './xhr';
import * as helper from '../helper';
import socket from '../../socket';

export default function ctrl(vnode) {

  helper.analyticsTrackView('Puzzle');
  socket.createDefault();

  this.data = null;

  this.menu = menu.controller(this);

  this.vm = {
    loading: false
  };

  const showLoading = function() {
    this.vm.loading = true;
    redraw();
  }.bind(this);

  const onXhrSuccess = function(res) {
    this.vm.loading = false;
    redraw();
    return res;
  }.bind(this);

  const onXhrError = function(res) {
    this.vm.loading = false;
    redraw();
    handleXhrError(res);
  }.bind(this);

  const revertLastMove = function() {
    if (this.data.progress.length === 0) {
      return;
    }
    const lastTurnColor = this.data.playHistory[this.data.playHistory.length - 1].turnColor;
    const nbPliesToRevert = lastTurnColor === this.data.player.color ? 2 : 1;
    this.data.progress = this.data.progress.slice(0, this.data.progress.length - nbPliesToRevert);
    this.data.playHistory = this.data.playHistory.slice(0, this.data.playHistory.length - nbPliesToRevert);
    const sitToRevertTo = this.data.playHistory[this.data.playHistory.length - 1];
    setTimeout(() => {
      this.chessground.set({
        fen: sitToRevertTo.fen,
        lastMove: sitToRevertTo.move,
        turnColor: sitToRevertTo.turnColor,
        check: sitToRevertTo.check,
        movableColor: 'both',
        dests: sitToRevertTo.dests
      });
      redraw();
    }, 1000);
  }.bind(this);

  const attempt = function(winFlag, giveUpFlag) {
    showLoading();
    xhr.attempt(this.data.puzzle.id, winFlag)
    .then(cfg => {
      cfg.progress = this.data.progress;
      this.reload(cfg);
      onXhrSuccess();
    })
    .catch(() => {
      if (!giveUpFlag) {
        revertLastMove();
      }
      const msg = 'Your move has failed to reach lichess server. Please retry to move when the network is back.';
      window.plugins.toast.show(msg, 'long', 'center');
      this.vm.loading = false;
    });
  }.bind(this);

  const userMove = function(orig, dest) {
    const res = puzzle.tryMove(this.data, [orig, dest]);
    const newProgress = res[0];
    const newLines = res[1];
    const lastMove = last(newProgress);
    const promotion = lastMove ? lastMove[4] : undefined;
    switch (newLines) {
      case 'retry':
        setTimeout(this.revert.bind(this, this.data.puzzle.id), 500);
        this.data.comment = 'retry';
        break;
      case 'fail':
        setTimeout(() => {
          if (this.data.mode === 'play') {
            this.chessground.stop();
            attempt(false);
          } else {
            this.revert(this.data.puzzle.id);
          }
        }, 500);
        this.data.comment = 'fail';
        break;
      default:
        this.userFinalizeMove([orig, dest, promotion], newProgress);
        if (newLines === 'win') {
          this.chessground.stop();
          attempt(true);
        } else {
          setTimeout(this.playOpponentNextMove.bind(this, this.data.puzzle.id), 1000);
        }
        break;
    }
    redraw();
  }.bind(this);

  const onMove = function(orig, dest, captured) {
    if (captured) sound.capture();
    else sound.move();
  };

  this.revert = function(id) {
    if (id !== this.data.puzzle.id) return;
    this.chessground.set({
      fen: this.data.chess.fen(),
      lastMove: chess.lastMove(this.data.chess),
      turnColor: this.data.puzzle.color,
      check: null,
      dests: this.data.chess.dests()
    });
    redraw();
    if (this.data.chess.in_check()) this.chessground.setCheck();
  }.bind(this);

  this.userFinalizeMove = function(move, newProgress) {
    chess.move(this.data.chess, move);
    this.data.comment = 'great';
    this.data.progress = newProgress;
    this.data.playHistory.push({
      move,
      fen: this.data.chess.fen(),
      dests: this.data.chess.dests(),
      check: this.data.chess.in_check(),
      turnColor: this.data.chess.turn() === 'w' ? 'white' : 'black'
    });
    this.chessground.set({
      fen: this.data.chess.fen(),
      lastMove: [move[0], move[1]],
      turnColor: this.data.puzzle.opponentColor,
      check: null
    });
    if (this.data.chess.in_check()) this.chessground.setCheck();
  }.bind(this);

  this.playOpponentMove = function(move) {
    onMove(move[0], move[1], this.chessground.data.pieces[move[1]]);
    chess.move(this.data.chess, move);
    this.data.playHistory.push({
      move,
      fen: this.data.chess.fen(),
      dests: this.data.chess.dests(),
      check: this.data.chess.in_check(),
      turnColor: this.data.chess.turn() === 'w' ? 'white' : 'black'
    });
    this.chessground.set({
      fen: this.data.chess.fen(),
      lastMove: move,
      dests: this.data.chess.dests(),
      turnColor: this.data.puzzle.color,
      check: null
    });
    if (this.data.chess.in_check()) this.chessground.setCheck();
    setTimeout(this.chessground.playPremove, this.chessground.data.animation.duration);
    redraw();
  }.bind(this);

  this.playOpponentNextMove = function(id) {
    if (id !== this.data.puzzle.id) return;
    var move = puzzle.getOpponentNextMove(this.data);
    this.playOpponentMove(puzzle.str2move(move));
    this.data.progress.push(move);
    if (puzzle.getCurrentLines(this.data) === 'win') {
      setTimeout(() => attempt(true), 300);
    }
  }.bind(this);

  this.playInitialMove = function() {
    if (this.data.mode !== 'view') {
      this.playOpponentMove(this.data.puzzle.initialMove);
    }
  }.bind(this);

  this.giveUp = function() {
    attempt(false, true);
  };

  this.jump = function(to) {
    const history = this.data.replay.history;
    const step = this.data.replay.step;
    const state = this.data.replay.history[to];
    if (!(step !== to && to >= 0 && to < history.length)) return false;
    chessground.anim(puzzle.jump, this.chessground.data)(this.data, to);
    if (step + 1 === to) {
      if (state.capture) sound.capture();
      else sound.move();
    }
    return true;
  }.bind(this);

  this.jumpFirst = this.jump.bind(this, 0);

  this.jumpPrev = function() {
    return this.jump(this.data.replay.step - 1);
  }.bind(this);

  this.jumpNext = function() {
    return this.jump(this.data.replay.step + 1);
  }.bind(this);

  this.jumpLast = function() {
    this.jump(this.data.replay.history.length - 1);
  }.bind(this);

  this.reload = function(cfg) {
    this.data = makeData(cfg);
    chessground.board.reset(this.chessground.data);
    chessground.anim(puzzle.reload, this.chessground.data)(this.data, cfg);
    setTimeout(this.playInitialMove, 1000);
  }.bind(this);

  this.init = function(cfg) {
    this.data = makeData(cfg);
    const chessgroundConf = {
      batchRAF: batchRequestAnimationFrame,
      fen: this.data.puzzle.fen,
      orientation: this.data.puzzle.color,
      coordinates: settings.game.coords(),
      turnColor: this.data.puzzle.opponentColor,
      highlight: {
        lastMove: settings.game.highlights(),
        check: settings.game.highlights(),
        dragOver: false
      },
      movable: {
        free: false,
        color: this.data.mode !== 'view' ? this.data.puzzle.color : null,
        showDests: settings.game.pieceDestinations(),
        events: {
          after: userMove
        }
      },
      events: {
        move: onMove
      },
      animation: {
        enabled: true,
        duration: 300
      },
      premovable: {
        enabled: false
      },
      draggable: {
        distance: 3,
        squareTarget: true,
        magnified: settings.game.magnified()
      }
    };
    if (this.chessground) this.chessground.reconfigure(chessgroundConf);
    else this.chessground = new chessground.controller(chessgroundConf);
    redraw();
  }.bind(this);

  this.newPuzzle = function(feedback) {
    if (feedback) showLoading();
    xhr.newPuzzle()
    .then(cfg => {
      if (feedback) pushState(cfg);
      else replaceStateForNewPuzzle(cfg);
      this.init(cfg);
      setTimeout(this.playInitialMove, 1000);
    })
    .then(onXhrSuccess)
    .catch(onXhrError);
  }.bind(this);

  this.loadPuzzle = function(id) {
    xhr.loadPuzzle(id)
      .then(cfg => {
        this.init(cfg);
        setTimeout(this.playInitialMove, 1000);
      })
      .then(onXhrSuccess)
      .catch(onXhrError);
  }.bind(this);

  this.retry = function() {
    showLoading();
    xhr.loadPuzzle(this.data.puzzle.id)
      .then(this.reload)
      .then(onXhrSuccess)
      .catch(onXhrError);
  }.bind(this);

  this.share = function() {
    window.plugins.socialsharing.share(null, null, null, `http://lichess.org/training/${this.data.puzzle.id}`);
  }.bind(this);

  this.goToAnalysis = function() {
    const fen = this.data.replay.history[0].fen
    router.set(`/analyse/variant/standard/fen/${encodeURIComponent(fen)}?color=${this.data.puzzle.color}`)
  }.bind(this);

  if (vnode.attrs.id) {
    this.loadPuzzle(vnode.attrs.id);
  } else {
    this.newPuzzle(false);
  }

  signals.afterLogin.add(this.retry);

  window.plugins.insomnia.keepAwake();

}

function pushState(cfg) {
  try {
    window.history.pushState(null, null, '?=/training/' + cfg.puzzle.id);
  } catch (e) { console.error(e); }
  return cfg;
}

function replaceStateForNewPuzzle(cfg) {
  // ugly hack to bypass mithril's postRedraw hook
  setTimeout(function() {
    try {
      window.history.replaceState(window.history.state, null, '?=/training/' + cfg.puzzle.id);
    } catch (e) { console.error(e); }
  }, 100);
  return cfg;
}
