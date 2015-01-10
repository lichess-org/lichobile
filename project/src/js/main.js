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

  document.addEventListener('backbutton', function() {
    // todo
    window.navigator.app.exitApp();
  }, false);

  setTimeout(function() {
    window.navigator.splashscreen.hide();
  }, 2000);
}

document.addEventListener('deviceready',
  // i18n must be loaded before any rendering happens
  utils.partial(i18n.loadPreferredLanguage, main),
  false
);
