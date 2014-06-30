/* lichess-mobile application entry point */

'use strict';

var play = require('./play'),
    $ = require('./vendor/zepto');

function main() {

  $('#play-button').tap(function(e) {
    e.preventDefault();
    play();
  });

}

window.document.addEventListener(window.cordova ? 'deviceready' : 'DOMContentLoaded', main, false);
