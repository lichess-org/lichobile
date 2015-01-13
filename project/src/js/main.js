/* application entry point */

// require mithril globally for convenience
window.m = require('mithril');

// cordova plugins polyfills for browser
if (!window.cordova) require('./cordovaPolyfills.js');

var utils = require('./utils');
var session = require('./session');
var i18n = require('./i18n');

var home = require('./ui/home');
var login = require('./ui/login');
var play = require('./ui/play');
var seek = require('./ui/seek');

function main() {

  m.route(document.body, '/', {
    '/': home,
    '/login': login,
    '/seek/:id': seek,
    '/play/:id': play
  });

  if (utils.hasNetwork()) session.refresh(true);

  window.cordova.plugins.Keyboard.disableScroll(true);

  if (window.gaId) window.analytics.startTrackerWithId(window.gaId);

  setTimeout(function() {
    window.navigator.splashscreen.hide();
  }, 500);
}

document.addEventListener('deviceready',
  // i18n must be loaded before any rendering happens
  utils.ƒ(i18n.loadPreferredLanguage, main),
  false
);
