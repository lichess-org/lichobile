/* lichess-mobile application entry point */

'use strict';

require('./knockoutExtend');

var play = require('./play'),
    $ = require('./vendor/zepto'),
    settings = require('./settings'),
    storage = require('./storage'),
    ko = require('knockout');

ko.applyBindings(settings, document.getElementById('settingsModal'));

function main() {

  var currGame = storage.get('currentGame');

  if (currGame) {
    play.resume(currGame);
  }

  $('#play-button').tap(function(e) {
    e.preventDefault();
    play.start();
  });

  $('#settingsModal').tap(function(e) {
    e.preventDefault();
  });

}

window.document.addEventListener(window.cordova ? 'deviceready' : 'DOMContentLoaded', main, false);
