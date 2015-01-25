var chessground = require('chessground');
var game = require('../round/game');
var partial = chessground.util.partial;
var promotion = require('./promotion');
var ground = require('./ground');
var makeData = require('./data');
var i18n = require('../../i18n');
var menu = require('../menu');
var session = require('../../session');
var sound = require('../../sound');
var replayCtrl = require('./replay/replayCtrl');
var storage = require('../../storage');

module.exports = function(cfg) {

  var storageKey = 'otb.current';

  var userMove = function(orig, dest) {
    promotion.start(this, orig, dest);
    sound.move();
    this.replay.addMove(orig, dest);
    save();
    m.redraw();
  }.bind(this);

  var onCapture = function(key) {
    sound.capture();
  }.bind(this);

  this.init = function(data, situations, ply) {
    this.data = data || makeData(cfg);
    this.vm = {
      showingActions: false
    };
    if (!this.chessground)
      this.chessground = ground.make(this.data, this.data.game.fen, userMove, onCapture);
    else ground.reload(this.chessground, this.data, this.data.game.fen);
    if (!this.replay) this.replay = new replayCtrl(this, situations, ply);
    else this.replay.init(situations, ply);
    this.replay.apply();
  }.bind(this);

  this.initAs = function(color) {
    this.init(makeData({color: color}));
  }.bind(this);

  var saved = storage.get(storageKey);
  if (saved) this.init(saved.data, saved.situations, saved.ply);
  else this.init();

  var save = function() {
    storage.set(storageKey, {
      data: this.data,
      situations: this.replay.situations,
      ply: this.replay.ply
    });
  }.bind(this);

  this.showActions = function() {
    menu.close();
    this.vm.showingActions = true;
  }.bind(this);

  this.hideActions = function() {
    this.vm.showingActions = false;
  }.bind(this);

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
