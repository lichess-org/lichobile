import { throttle } from 'lodash/function';
import data from './data';
import * as utils from '../../utils';
import sound from '../../sound';
import gameApi from '../../lichess/game';
import ground from './ground';
import promotion from './promotion';
import chat from './chat';
import clockCtrl from './clock/clockCtrl';
import i18n from '../../i18n';
import gameStatus from '../../lichess/status';
import correspondenceClockCtrl from './correspondenceClock/correspondenceCtrl';
import session from '../../session';
import socket from '../../socket';
import signals from '../../signals';
import socketHandler from './socketHandler';
import atomic from './atomic';
import backbutton from '../../backbutton';
import helper from '../helper';
import * as xhr from './roundXhr';
import m from 'mithril';

export default function controller(cfg, onFeatured, onTVChannelChange, userTv, onUserTVRedirect) {

  helper.analyticsTrackView('Round');

  this.data = data(cfg);

  this.onTVChannelChange = onTVChannelChange;

  this.firstPly = function() {
    return this.data.steps[0].ply;
  }.bind(this);

  this.lastPly = function() {
    return this.data.steps[this.data.steps.length - 1].ply;
  }.bind(this);

  this.plyStep = function(ply) {
    return this.data.steps[ply - this.firstPly()];
  }.bind(this);

  this.vm = {
    flip: false,
    showingActions: false,
    replayHash: '',
    buttonsHash: '',
    ply: this.lastPly(),
    moveToSubmit: null
  };

  var connectSocket = function() {
    socket.createGame(
      this.data.url.socket,
      this.data.player.version,
      socketHandler(this, onFeatured, onUserTVRedirect),
      this.data.url.round,
      userTv
    );
  }.bind(this);

  connectSocket();

  // reconnect game socket after a cancelled seek
  signals.seekCanceled.add(connectSocket);

  this.stepsHash = function(steps) {
    var h = '';
    for (var i in steps) {
      h += steps[i].san;
    }
    return h;
  };

  this.showActions = function() {
    backbutton.stack.push(this.hideActions);
    this.vm.showingActions = true;
  }.bind(this);

  this.hideActions = function(fromBB) {
    if (fromBB !== 'backbutton' && this.vm.showingActions) backbutton.stack.pop();
    this.vm.showingActions = false;
  }.bind(this);

  this.flip = function() {
    if (this.data.tv) {
      if (m.route.param('flip')) m.route('/tv');
      else m.route('/tv?flip=1');
      return;
    } else if (this.data.player.spectator) {
      m.route('/game/' + this.data.game.id + '/' +
        utils.oppositeColor(this.data.player.color));
      return;
    }
    this.vm.flip = !this.vm.flip;
    this.chessground.set({
      orientation: this.vm.flip ? this.data.opponent.color : this.data.player.color
    });
  }.bind(this);

  this.replaying = function() {
    return this.vm.ply !== this.lastPly();
  }.bind(this);

  this.jump = function(ply) {
    if (ply < this.firstPly() || ply > this.lastPly()) return;
    this.vm.ply = ply;
    var s = this.plyStep(ply);
    var config = {
      fen: s.fen,
      lastMove: s.uci ? [s.uci.substr(0, 2), s.uci.substr(2, 2)] : null,
      check: s.check,
      turnColor: this.vm.ply % 2 === 0 ? 'white' : 'black'
    };
    if (this.replaying()) this.chessground.stop();
    else config.movable = {
      color: gameApi.isPlayerPlaying(this.data) ? this.data.player.color : null,
      dests: gameApi.parsePossibleMoves(this.data.possibleMoves)
    };
    this.chessground.set(config);
  }.bind(this);

  this.jumpNext = function() {
    this.jump(this.vm.ply + 1);
  }.bind(this);

  this.jumpPrev = function() {
    this.jump(this.vm.ply - 1);
  }.bind(this);

  this.jumpFirst = function() {
    this.jump(this.firstPly());
  }.bind(this);

  this.jumpLast = function() {
    this.jump(this.lastPly());
  }.bind(this);

  this.setTitle = function() {
    if (this.data.tv)
      this.title = 'Lichess TV';
    else if (this.data.userTV)
      this.title = this.data.userTV;
    else if (gameStatus.finished(this.data))
      this.title = i18n('gameOver');
    else if (gameStatus.aborted(this.data))
      this.title = i18n('gameAborted');
    else if (gameApi.isPlayerTurn(this.data))
      this.title = i18n('yourTurn');
    else if (gameApi.isOpponentTurn(this.data))
      this.title = i18n('waitingForOpponent');
    else
      this.title = 'lichess.org';
  };
  this.setTitle();

  this.sendMove = function(orig, dest, prom) {
    var move = {
      from: orig,
      to: dest
    };
    if (prom) move.promotion = prom;
    if (this.clock && socket.getAverageLag() !== undefined)
      move.lag = Math.round(socket.getAverageLag());

    if (this.data.pref.submitMove) {
      setTimeout(function() {
        backbutton.stack.push(this.cancelMove);
        this.vm.moveToSubmit = move;
        m.redraw();
      }.bind(this), this.data.pref.animationDuration || 0);
    } else socket.send('move', move, { ackable: true });
  };

  this.cancelMove = function(fromBB) {
    if (fromBB !== 'backbutton') backbutton.stack.pop();
    this.vm.moveToSubmit = null;
    this.jump(this.vm.ply);
  }.bind(this);

  this.submitMove = function(v) {
    if (v) {
      if (this.vm.moveToSubmit)
        socket.send('move', this.vm.moveToSubmit, {
          ackable: true
        });
        this.vm.moveToSubmit = null;
    } else {
      this.cancelMove();
    }
  }.bind(this);

  var userMove = function(orig, dest, meta) {
    if (!promotion.start(this, orig, dest, meta.premove)) this.sendMove(orig, dest);
  }.bind(this);

  var onMove = function(orig, dest, capturedPiece) {
    if (capturedPiece) {
      if (this.data.game.variant.key === 'atomic') {
        atomic.capture(this, dest);
        sound.explosion();
      }
      else sound.capture();
    } else sound.move();
  }.bind(this);

  this.apiMove = function(o) {
    m.startComputation();
    let d = this.data;
    d.game.turns = o.ply;
    d.game.player = o.ply % 2 === 0 ? 'white' : 'black';
    const playedColor = o.ply % 2 === 0 ? 'black' : 'white';
    if (o.status) d.game.status = o.status;
    d[d.player.color === 'white' ? 'player' : 'opponent'].offeringDraw = o.wDraw;
    d[d.player.color === 'black' ? 'player' : 'opponent'].offeringDraw = o.bDraw;
    d.possibleMoves = d.player.color === d.game.player ? o.dests : null;
    this.setTitle();

    if (!this.replaying()) {
      this.vm.ply++;
      this.chessground.apiMove(o.uci.substr(0, 2), o.uci.substr(2, 2));

      if (o.enpassant) {
        let p = o.enpassant;
        let pieces = {};
        pieces[p.key] = null;
        this.chessground.setPieces(pieces);
        if (d.game.variant.key === 'atomic') atomic.enpassant(this, p.key, p.color);
        sound.capture();
      }

      if (o.promotion) ground.promote(this.chessground, o.promotion.key, o.promotion.pieceClass);

      if (o.castle && !this.chessground.data.autoCastle) {
        let c = o.castle;
        let pieces = {};
        pieces[c.king[0]] = null;
        pieces[c.rook[0]] = null;
        pieces[c.king[1]] = {
          role: 'king',
          color: c.color
        };
        pieces[c.rook[1]] = {
          role: 'rook',
          color: c.color
        };
        this.chessground.setPieces(pieces);
      }

      this.chessground.set({
        turnColor: d.game.player,
        movable: {
          dests: gameApi.isPlayerPlaying(d) ? gameApi.parsePossibleMoves(d.possibleMoves) : {}
        },
        check: o.check
      });

      if (playedColor !== d.player.color) {
        // atrocious hack to prevent race condition
        // with explosions and premoves
        // https://github.com/ornicar/lila/issues/343
        if (d.game.variant.key === 'atomic') setTimeout(this.chessground.playPremove, 100);
        else this.chessground.playPremove();
      }
      if (this.data.game.speed === 'correspondence') session.refresh();
    }

    if (o.clock) {
      let c = o.clock;
      if (this.clock) this.clock.update(c.white, c.black);
      else if (this.correspondenceClock) this.correspondenceClock.update(c.white, c.black);
    }

    d.game.threefold = !!o.threefold;
    d.steps.push({
      ply: this.lastPly() + 1,
      fen: o.fen,
      san: o.san,
      uci: o.uci,
      check: o.check
    });
    gameApi.setOnGame(d, playedColor, true);
    m.endComputation();
  }.bind(this);

  this.chessground = ground.make(this.data, cfg.game.fen, userMove, onMove);

  this.clock = this.data.clock ? new clockCtrl(
    this.data.clock,
    this.data.player.spectator ? function() {} : throttle(function() {
      socket.send('outoftime');
    }, 500),
    this.data.player.spectator ? null : this.data.player.color
  ) : false;

  this.isClockRunning = function() {
    return this.data.clock && gameApi.playable(this.data) &&
      ((this.data.game.turns - this.data.game.startedAtTurn) > 1 || this.data.clock.running);
  }.bind(this);

  this.clockTick = function() {
    if (this.isClockRunning()) this.clock.tick(this.data.game.player);
  }.bind(this);

  var makeCorrespondenceClock = function() {
    if (this.data.correspondence && !this.correspondenceClock)
      this.correspondenceClock = new correspondenceClockCtrl(
        this,
        this.data.correspondence,
        () => socket.send('outoftime')
      );
  }.bind(this);
  makeCorrespondenceClock();

  var correspondenceClockTick = function() {
    if (this.correspondenceClock && gameApi.playable(this.data))
      this.correspondenceClock.tick(this.data.game.player);
  }.bind(this);

  var clockIntervId;
  if (this.clock) clockIntervId = setInterval(this.clockTick, 100);
  else if (this.correspondenceClock) clockIntervId = setInterval(correspondenceClockTick, 1000);

  this.chat = (this.data.opponent.ai || this.data.player.spectator) ?
    null : new chat.controller(this);

  this.reload = function(rCfg) {
    if (this.stepsHash(rCfg.steps) !== this.stepsHash(this.data.steps))
      this.vm.ply = rCfg.steps[rCfg.steps.length - 1].ply;
    if (this.chat) this.chat.onReload(rCfg.chat);
    if (this.data.tv) rCfg.tv = this.data.tv;
    if (this.data.userTV) rCfg.userTV = this.data.userTV;
    this.data = data(rCfg);
    makeCorrespondenceClock();
    this.setTitle();
    if (!this.replaying()) ground.reload(this.chessground, this.data, rCfg.game.fen, this.vm.flip);
  }.bind(this);

  window.plugins.insomnia.keepAwake();

  var onResume = function() {
    xhr.reload(this).then(this.reload);
  }.bind(this);

  document.addEventListener('resume', onResume);

  this.onunload = function() {
    socket.destroy();
    clearInterval(clockIntervId);
    if (this.chat) this.chat.onunload();
    document.removeEventListener('resume', onResume);
    window.plugins.insomnia.allowSleepAgain();
    signals.seekCanceled.remove(connectSocket);
  };
}

