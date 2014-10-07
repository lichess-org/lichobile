var throttle = require('lodash-node/modern/functions/throttle');
var chessground = require('chessground');
var partial = chessground.util.partial;
var data = require('./data');
var round = require('./round');
var ground = require('./ground');
var socket = require('./socket');
var promotion = require('./promotion');
var clockCtrl = require('./clock/ctrl');

module.exports = function(cfg, router, socketSend) {

  this.data = data(cfg);
  console.log(this.data);

  this.socket = new socket(socketSend, this);

  this.sendMove = function(orig, dest, prom) {
    var move = {
      from: orig,
      to: dest,
    };
    if (prom) move.promotion = prom;
    this.socket.send('move', move, {
      ackable: true
    });
  }.bind(this);

  this.userMove = function(orig, dest, isPremove) {
    if (!promotion.start(this, orig, dest, isPremove)) this.sendMove(orig, dest);
  }.bind(this);

  this.chessground = ground.make(this.data, cfg.game.fen, this.userMove);

  this.reload = function(cfg) {
    this.data = data(cfg);
    ground.reload(this.chessground, this.data, cfg.game.fen);
  }.bind(this);

  this.clock = this.data.clock ? new clockCtrl(
    this.data.clock,
    throttle(partial(this.socket.send, 'outoftime'), 500)
  ) : false;

  this.isClockRunning = function() {
    return round.playable(this.data) && ((this.data.game.turns - this.data.game.startedAtTurn) > 1 || this.data.game.clockRunning);
  }.bind(this);

  this.clockTick = function() {
    if (this.isClockRunning()) this.clock.tick(this.data.game.player);
  }.bind(this);

  if (this.clock) setInterval(this.clockTick, 100);

  this.router = router;

};
