/* lichess-mobile application entry point */

'use strict';

require('./knockoutExtend');

var play = require('./play'),
    Zepto = require('./vendor/zepto'),
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

  Zepto('#play-button').tap(function(e) {
    e.preventDefault();
    Zepto('#gameModal').removeClass('active');
    play.start();
  });

  Zepto('#settingsModal').tap(function(e) {
    e.preventDefault();
  });

}

window.document.addEventListener(window.cordova ? 'deviceready' : 'DOMContentLoaded', main, false);
