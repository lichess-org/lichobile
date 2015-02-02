/* application entry point */

// require mithril globally for convenience
window.m = require('mithril');
// for moment a global object makes loading locales easier
window.moment = require('moment');

var utils = require('./utils');
var session = require('./session');
var i18n = require('./i18n');
var xhr = require('./xhr');

var home = require('./ui/home');
var play = require('./ui/play');
var seek = require('./ui/seek');
var otb = require('./ui/otb/main');

var refreshInterval = 60000;
var refreshIntervalID;

function refresh() {
  if (utils.hasNetwork() && session.isConnected()) session.refresh();
}

function onResume() {
  refresh();
  refreshIntervalID = setInterval(refresh, refreshInterval);
}

function onPause() {
  clearInterval(refreshIntervalID);
}

function onOnline() {
  if (/^\/$/.test(m.route())) {
    session.rememberLogin().then(function() {
      var nowPlaying = session.nowPlaying();
      if (nowPlaying.length)
        m.route('/play/' + nowPlaying[0].fullId);
      else
        window.plugins.toast.show(i18n('connectedToLichess'), 'long', 'center');
    }, function(err) {
      // means user is anonymous here
      if (err.message === 'unauthorizedError') {
        window.plugins.toast.show(i18n('connectedToLichessAnonymous'), 'long', 'center');
      }
    });
  }
}

function main() {

  m.route(document.body, '/', {
    '/': home,
    '/seek': seek,
    '/otb': otb,
    '/play/:id': play
  });

  // pull session data once (to log in user automatically thanks to cookie)
  // and also listen to online event in case network was disconnected at app
  // startup
  if (utils.hasNetwork())
    onOnline();
  else
    window.navigator.notification.alert(i18n('noInternetConnection'), null, i18n('connectionError'));

  document.addEventListener('online', onOnline, false);

  // if connected, refresh data every min, and on resume
  refreshIntervalID = setInterval(refresh, refreshInterval);
  document.addEventListener('resume', onResume, false);
  document.addEventListener('pause', onPause, false);

  // iOs keyboard hack
  // TODO we may want to remove this and call only on purpose
  window.cordova.plugins.Keyboard.disableScroll(true);

  if (window.lichess.gaId) window.analytics.startTrackerWithId(window.lichess.gaId);

  setTimeout(function() {
    window.navigator.splashscreen.hide();
    xhr.status();
  }, 500);
}

document.addEventListener('deviceready',
  // i18n must be loaded before any rendering happens
  utils.ƒ(i18n.loadPreferredLanguage, main),
  false
);
