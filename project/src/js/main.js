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

function onResume() {
  session.refresh(true);
}

function main() {

  m.route(document.body, '/', {
    '/': home,
    '/login': login,
    '/seek/:id': seek,
    '/play/:id': play
  });

  // refresh data once and on app resume
  if (utils.hasNetwork()) session.refresh(true);
  document.addEventListener('resume', onResume, false);

  // iOs keyboard hack
  // TODO we may want to remove this and call only on purpose
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
