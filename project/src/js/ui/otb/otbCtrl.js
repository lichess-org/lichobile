var promotion = require('./promotion');
var ground = require('./ground');
var makeData = require('./data');
var sound = require('../../sound');
var replayCtrl = require('./replay/replayCtrl');
var storage = require('../../storage');
var gamesMenu = require('../gamesMenu');
var actions = require('./actions');

module.exports = function(cfg) {

  window.analytics.trackView('On The Board');

  var storageKey = 'otb.current';

  var addMove = function(orig, dest, promotionRole) {
    this.replay.addMove(orig, dest, promotionRole);
    save();
    m.redraw();
    if (this.replay.situation().checkmate) setTimeout(function() {
      this.actions.open();
      m.redraw();
    }.bind(this), 1000);
  }.bind(this);

  var onPromotion = function(orig, dest, role) {
    addMove(orig, dest, role);
  }.bind(this);

  var userMove = function(orig, dest) {
    if (!promotion.start(this, orig, dest, onPromotion)) {
      addMove(orig, dest);
    }
  }.bind(this);

  var onCapture = function() {
    sound.capture();
  }.bind(this);

  var onMove = function() {
    sound.move();
  };

  this.init = function(data, situations, ply) {
    this.data = data || makeData(cfg);
    if (!this.chessground)
      this.chessground = ground.make(this.data, this.data.game.fen, userMove, onMove, onCapture);
    else ground.reload(this.chessground, this.data, this.data.game.fen);
    if (!this.replay) this.replay = new replayCtrl(this, situations, ply);
    else this.replay.init(situations, ply);
    this.replay.apply();
    this.actions = new actions.controller(this);
  }.bind(this);

  this.initAs = function(color) {
    this.init(makeData({
      color: color
    }));
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

  window.plugins.insomnia.keepAwake();

  var onBackButton = function() {
    if (this.actions.isOpen()) {
      this.actions.close();
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
