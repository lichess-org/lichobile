var chessground = require('chessground');
var partial = chessground.util.partial;
var promotion = require('./promotion');
var i18n = require('../../i18n');
var menu = require('../menu');
var session = require('../../session');
var sound = require('../../sound');

module.exports = function(cfg) {

  this.data = cfg;

  var userMove = function(orig, dest, meta) {
    promotion.start(this, orig, dest, meta.premove);
    sound.move();
  }.bind(this);

  var onCapture = function(key) {
    sound.capture();
  }.bind(this);

  this.chessground = ground.make(this.data, cfg.game.fen, userMove, onCapture);

  window.plugins.insomnia.keepAwake();

  document.addEventListener('backbutton', onBackButton, false);

  this.onunload = function() {
    document.removeEventListener('backbutton', onBackButton, false);
    window.plugins.insomnia.allowSleepAgain();
  };
};
