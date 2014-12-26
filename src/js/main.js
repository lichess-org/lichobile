/* application entry point */

// require mithril globally for convenience
window.m = require('mithril');

// cordova plugins polyfills for browser
if (!window.cordova) require('./cordovaPolyfills.js');

var utils = require('./utils');
var session = require('./session');

var home = require('./ui/home');
var play = require('./ui/play');
var seek = require('./ui/seek');

function main() {

  m.route(document.body, '/', {
    '/': home,
    '/seek': seek,
    '/play/:id': play
  });

  if (utils.hasNetwork()) session.refresh(true);

  document.addEventListener('backbutton', function() {
    // todo
    window.navigator.app.exitApp();
  }, false);

  setTimeout(function() {
    window.navigator.splashscreen.hide();
  }, 2000);
}

document.addEventListener(window.cordova ? 'deviceready' : 'DOMContentLoaded', main, false);
