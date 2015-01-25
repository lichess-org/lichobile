var chessground = require('chessground');
var game = require('../round/game');
var partial = chessground.util.partial;
var promotion = require('./promotion');
var ground = require('./ground');
var data = require('./data');
var i18n = require('../../i18n');
var menu = require('../menu');
var session = require('../../session');
var sound = require('../../sound');
var replayCtrl = require('./replay/replayCtrl');

module.exports = function(cfg) {

  this.data = data(cfg);
  this.vm = {
    showingActions: !game.playable(this.data)
  };

  var userMove = function(orig, dest) {
    promotion.start(this, orig, dest);
    sound.move();
    this.replay.addMove(orig, dest);
    m.redraw();
  }.bind(this);

  var onCapture = function(key) {
    sound.capture();
  }.bind(this);

  this.chessground = ground.make(this.data, this.data.game.fen, userMove, onCapture);

  this.replay = new replayCtrl(this);
  this.replay.apply();

  window.plugins.insomnia.keepAwake();

  var onBackButton = function() {
    if (this.vm.showingActions) {
      this.hideActions();
      m.redraw();
    } else if (gamesMenu.isOpen()) {
      gamesMenu.close();
      m.redraw();
    } else
      window.navigator.app.backHistory();
  }.bind(this);

  document.addEventListener('backbutton', onBackButton, false);

  this.onunload = function() {
    document.removeEventListener('backbutton', onBackButton, false);
    window.plugins.insomnia.allowSleepAgain();
  };
};
