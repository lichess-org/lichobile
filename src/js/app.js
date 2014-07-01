/* lichess-mobile application entry point */

'use strict';

require('./knockoutExtend');

var play = require('./play'),
    $ = require('./vendor/zepto'),
    settings = require('./settings'),
    ko = require('knockout');


function main() {

  ko.applyBindings(settings, document.getElementById('settingsModal'));

  $('#play-button').tap(function(e) {
    e.preventDefault();
    play();
  });

  $('#settingsModal').tap(function(e) {
    e.preventDefault();
  });

}

window.document.addEventListener(window.cordova ? 'deviceready' : 'DOMContentLoaded', main, false);
