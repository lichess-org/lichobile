var promotion = require('./promotion');
var ground = require('./ground');
var makeData = require('./data');
var sound = require('../../sound');
var replayCtrl = require('./replay/replayCtrl');
var storage = require('../../storage');
var settings = require('../../settings');
var actions = require('./actions');
var engine = require('./engine');

module.exports = function(cfg) {

  window.analytics.trackView('Offline AI');

  var storageKey = 'ai.current';

  var addMove = function(orig, dest, promotionRole) {
    this.replay.addMove(orig, dest, promotionRole);
    engine.addMove(orig, dest, promotionRole);
    this.data.game.fen = engine.getFen();
    save();
    m.redraw();
    if (this.replay.situation().checkmate) setTimeout(function() {
      this.actions.open();
      m.redraw();
    }.bind(this), 1000);
    else engineMove();
  }.bind(this);

  this.getOpponent = function() {
    var level = settings.ai.opponent();
    return {
      name: settings.ai.availableOpponents.filter(function(o) {
        return o[1] == level;
      })[0][0],
      level: parseInt(level) || 1
    };
  }.bind(this);

  var engineMove = function() {
    if (this.chessground.data.turnColor !== this.data.player.color) setTimeout(function() {
      engine.setLevel(this.getOpponent().level);
      engine.search(function(move) {
        addMove(move[0], move[1], move[2]);
      });
    }.bind(this), 300);
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
    if (this.actions) this.actions.close();
    else this.actions = new actions.controller(this);
    engine.init(this.data.game.fen);
    engineMove();
  }.bind(this);

  this.initAs = function(color) {
    this.init(makeData({
      color: color
    }));
  }.bind(this);

  var saved = storage.get(storageKey);
  if (saved) try {
    this.init(saved.data, saved.situations, saved.ply);
  } catch (e) {
    console.log(e, 'Fail to load saved game');
    this.init();
  } else this.init();

  var save = function() {
    storage.set(storageKey, {
      data: this.data,
      situations: this.replay.situations,
      ply: this.replay.ply
    });
  }.bind(this);

  window.plugins.insomnia.keepAwake();

  this.onunload = function() {
    window.plugins.insomnia.allowSleepAgain();
  };
};
