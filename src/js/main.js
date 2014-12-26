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
var i18n = require('./i18n');

function main() {

  m.route(document.body, '/', {
    '/': home,
    '/seek/:id': seek,
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

document.addEventListener(
  window.cordova ? 'deviceready' : 'DOMContentLoaded',
  // i18n must be loaded before any rendering happens
  i18n.loadPreferredLanguage(main),
  false);
