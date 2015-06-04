import { throttle } from 'lodash/function';
import data from './data';
import utils from '../../utils';
import sound from '../../sound';
import gameApi from '../../lichess/game';
import ground from './ground';
import promotion from './promotion';
import replayCtrl from './replay/replayCtrl';
import chat from './chat';
import clockCtrl from './clock/clockCtrl';
import i18n from '../../i18n';
import gameStatus from '../../lichess/status';
import correspondenceClockCtrl from './correspondenceClock/correspondenceCtrl';
import menu from '../menu';
import session from '../../session';
import socket from '../../socket';
import socketHandler from './socketHandler';
import signals from '../../signals';
import atomic from './atomic';
import backbutton from '../../backbutton';
import helper from '../helper';
import xhr from './roundXhr';

export default function controller(cfg, onFeatured) {

  this.data = data(cfg);

  helper.analyticsTrackView('Round');

  this.vm = {
    connectedWS: true,
    flip: false,
    showingActions: false
  };

  socket.createGame(
    this.data.url.socket,
    this.data.player.version,
    socketHandler(this, onFeatured),
    this.data.url.round
  );

  this.showActions = function() {
    menu.close();
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

  this.setTitle = function() {
    if (this.data.tv)
      this.title = 'Lichess TV';
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
    socket.send('move', move, { ackable: true });
  };

  var userMove = function(orig, dest, meta) {
    if (!promotion.start(this, orig, dest, meta.premove)) this.sendMove(orig, dest);
    if (this.data.game.speed === 'correspondence' && session.isConnected())
      session.refresh();
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
    if (!this.replay.active) this.chessground.apiMove(o.from, o.to);
    if (this.data.game.threefold) this.data.game.threefold = false;
    this.data.game.moves.push(o.san);
    gameApi.setOnGame(this.data, o.color, true);
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
  else clockIntervId = setInterval(correspondenceClockTick, 1000);

  this.replay = new replayCtrl(this);

  this.chat = (this.data.opponent.ai || this.data.player.spectator) ?
    null : new chat.controller(this);

  this.reload = function(rCfg) {
    this.replay.onReload(rCfg);
    if (this.chat) this.chat.onReload(rCfg.chat);
    if (this.data.tv) rCfg.tv = true;
    this.data = data(rCfg);
    makeCorrespondenceClock();
    this.setTitle();
    if (!this.replay.active) ground.reload(this.chessground, this.data, rCfg.game.fen, this.vm.flip);
  }.bind(this);

  window.plugins.insomnia.keepAwake();

  var onConnected = function() {
    var wasOff = !this.vm.connectedWS;
    this.vm.connectedWS = true;
    if (wasOff) m.redraw();
  }.bind(this);

  var onDisconnected = function() {
    var wasOn = this.vm.connectedWS;
    this.vm.connectedWS = false;
    if (wasOn) setTimeout(function() {
      m.redraw();
    }, 2000);
  }.bind(this);

  var onResume = function() {
    xhr.reload(this).then(this.reload);
  }.bind(this);

  signals.socket.connected.add(onConnected);
  signals.socket.disconnected.add(onDisconnected);
  document.addEventListener('resume', onResume);

  this.onunload = function() {
    socket.destroy();
    if (clockIntervId) clearInterval(clockIntervId);
    if (this.chat) this.chat.onunload();
    signals.socket.connected.remove(onConnected);
    signals.socket.disconnected.remove(onDisconnected);
    document.removeEventListener('resume', onResume);
    window.plugins.insomnia.allowSleepAgain();
  };
}
