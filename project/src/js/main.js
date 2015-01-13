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

var refreshInterval;

function refresh() {
  if (utils.hasNetwork() && session.isConnected()) session.refresh(true);
}

function onResume() {
  refresh();
  refreshInterval = setInterval(refresh, 60000);
}

function onPause() {
  clearInterval(refreshInterval);
}

function main() {

  m.route(document.body, '/', {
    '/': home,
    '/login': login,
    '/seek/:id': seek,
    '/play/:id': play
  });

  // refresh data once (to log in user automatically thanks to cookie)
  // then, if connected, refresh every min, and on resume
  if (utils.hasNetwork()) session.refresh(true);
  refreshInterval = setInterval(refresh, 60000);
  document.addEventListener('resume', onResume, false);
  document.addEventListener('pause', onPause, false);

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
