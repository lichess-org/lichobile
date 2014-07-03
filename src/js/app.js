/* lichess-mobile application entry point */

'use strict';

require('./knockoutExtend');

var play = require('./play'),
    $ = require('./vendor/zepto'),
    settings = require('./settings'),
    ko = require('knockout'),
    signals = require('./signals'),
    storage = require('./storage');

function main() {

  var view = {
    claimDraw: function() {
      signals.claimDraw.dispatch();
    },
    settings: settings
  };
  ko.applyBindings(view);

  var currGame = storage.get('currentGame');

  if (currGame) {
    play.resume(currGame).done(function(game) {
      if (game && game.isFinished()) play.handleEndGame();
    });
  }

  $('#play-button').tap(function(e) {
    e.preventDefault();
    play.start();
  });

  $('#settingsModal').tap(function(e) {
    e.preventDefault();
  });

}

if (window.cordova && storage.get('settings.disableSleep')) window.plugins.insomnia.keepAwake();

window.document.addEventListener(window.cordova ? 'deviceready' : 'DOMContentLoaded', main, false);
