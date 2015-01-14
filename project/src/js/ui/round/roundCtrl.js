var throttle = require('lodash-node/modern/functions/throttle');
var chessground = require('chessground');
var partial = chessground.util.partial;
var data = require('./data');
var sound = require('../../sound');
var game = require('./game');
var ground = require('./ground');
var socket = require('./socket');
var promotion = require('./promotion');
var replayCtrl = require('./replay/replayCtrl');
var chat = require('./chat');
var clockCtrl = require('./clock/clockCtrl');
var i18n = require('../../i18n');
var gameStatus = require('./status');
var correspondenceClockCtrl = require('./correspondenceClock/correspondenceCtrl');
var menu = require('../menu');
var session = require('../../session');

module.exports = function(cfg, socketSend) {

  this.data = data(cfg);

  this.vm = {
    flip: false,
    reloading: false,
    redirecting: false,
    showingActions: !game.playable(this.data)
  };

  this.socket = socket(socketSend, this);

  this.showActions = function() {
    menu.close();
    this.vm.showingActions = true;
  }.bind(this);

  this.hideActions = function() {
    this.vm.showingActions = false;
  }.bind(this);

  this.flip = function() {
    this.vm.flip = !this.vm.flip;
    this.chessground.set({
      orientation: this.vm.flip ? this.data.opponent.color : this.data.player.color
    });
  }.bind(this);

  this.setTitle = function() {
    if (this.data.player.spectator) return;
    if (gameStatus.finished(this.data))
      this.title = i18n('gameOver');
    else if (gameStatus.aborted(this.data))
      this.title = i18n('gameAborted');
    else if (game.isPlayerTurn(this.data))
      this.title = i18n('yourTurn');
    else
      this.title = i18n('waitingForOpponent');
  };
  this.setTitle();

  this.sendMove = function(orig, dest, prom) {
    var move = {
      from: orig,
      to: dest
    };
    if (prom) move.promotion = prom;
    this.socket.send('move', move, {
      ackable: true
    });
  }.bind(this);

  this.userMove = function(orig, dest, meta) {
    if (!promotion.start(this, orig, dest, meta.premove)) this.sendMove(orig, dest);
    sound.move();
    if (this.data.game.speed === 'correspondence' && session.isConnected())
      session.refresh(true);
  }.bind(this);

  this.apiMove = function(o) {
    m.startComputation();
    if (this.replay.active) this.replay.vm.late = true;
    else this.chessground.apiMove(o.from, o.to);
    if (this.data.game.threefold) this.data.game.threefold = false;
    this.data.game.moves.push(o.san);
    game.setOnGame(this.data, o.color, true);
    m.endComputation();
    if (this.data.player.spectator || o.color !== this.data.player.color) sound.move();
  }.bind(this);

  this.chessground = ground.make(this.data, cfg.game.fen, this.userMove);

  this.reload = function(cfg) {
    this.replay.onReload(cfg);
    this.data = data(cfg);
    makeCorrespondenceClock();
    this.setTitle();
    if (!this.replay.active) ground.reload(this.chessground, this.data, cfg.game.fen, this.vm.flip);
  }.bind(this);

  this.clock = this.data.clock ? new clockCtrl(
    this.data.clock,
    this.data.player.spectator ? function() {} : throttle(partial(this.socket.send, 'outoftime'), 500)
  ) : false;

  this.isClockRunning = function() {
    return this.data.clock && game.playable(this.data) &&
      ((this.data.game.turns - this.data.game.startedAtTurn) > 1 || this.data.clock.running);
  }.bind(this);

  this.clockTick = function() {
    if (this.isClockRunning()) this.clock.tick(this.data.game.player);
  }.bind(this);

  var makeCorrespondenceClock = function() {
    if (this.data.correspondence && !this.correspondenceClock)
      this.correspondenceClock = new correspondenceClockCtrl(
        this.data.correspondence,
        partial(this.socket.send, 'outoftime')
      );
  }.bind(this);
  makeCorrespondenceClock();

  var correspondenceClockTick = function() {
    if (this.correspondenceClock && game.playable(this.data))
      this.correspondenceClock.tick(this.data.game.player);
  }.bind(this);

  var clockIntervId;
  if (this.clock) clockIntervId = setInterval(this.clockTick, 100);
  else clockIntervId = setInterval(correspondenceClockTick, 1000);

  this.replay = new replayCtrl(this);

  this.chat = !this.data.opponent.ai ? new chat.controller(this) : false;

  this.onunload = function() {
    if (clockIntervId) clearInterval(clockIntervId);
    if (this.chat) this.chat.onunload();
  };
};
