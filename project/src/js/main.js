/* application entry point */

// require mithril globally for convenience
window.m = require('mithril');
// for moment a global object makes loading locales easier
window.moment = require('moment');

if (window.lichess.mode === 'dev') {
  var Q = require('q');
  Q.longStackSupport = true;
  Q.onerror = function(err) { console.error(err, err.stack); };
}

var utils = require('./utils');
var session = require('./session');
var i18n = require('./i18n');
var xhr = require('./xhr');
var backbutton = require('./backbutton');
var menu = require('./ui/menu');
var storage = require('./storage');

var home = require('./ui/home');
var play = require('./ui/play');
var seek = require('./ui/seek');
var seeks = require('./ui/seeks');
var otb = require('./ui/otb/main');
var ai = require('./ui/ai/main');
var settingsUi = require('./ui/settings');
var boardThemes = require('./ui/settings/boardThemes');
var pieceThemes = require('./ui/settings/pieceThemes');
var friendsUi = require('./ui/friends');

var triedToLogin = false;

var refreshInterval = 60000;
var refreshIntervalID;

function main() {

  m.route(document.body, '/', {
    '/': home,
    '/seeks': seeks,
    '/seek': seek,
    '/otb': otb,
    '/ai': ai,
    '/play/:id': play,
    '/settings': settingsUi,
    '/settings/themes/board': boardThemes,
    '/settings/themes/piece': pieceThemes,
    '/friends': friendsUi
  });

  // pull session data once (to log in user automatically thanks to cookie)
  // and also listen to online event in case network was disconnected at app
  // startup
  if (utils.hasNetwork())
    onOnline();
  else {
    window.navigator.notification.alert(i18n('noInternetConnection'));
    menu.open();
    m.redraw();
  }

  document.addEventListener('online', onOnline, false);

  // if connected, refresh data every min, and on resume
  refreshIntervalID = setInterval(refresh, refreshInterval);
  document.addEventListener('resume', onResume, false);
  document.addEventListener('pause', onPause, false);

  // iOs keyboard hack
  // TODO we may want to remove this and call only on purpose
  window.cordova.plugins.Keyboard.disableScroll(true);

  if (window.lichess.gaId) window.analytics.startTrackerWithId(window.lichess.gaId);

  document.addEventListener('backbutton', backbutton, false);

  setTimeout(function() {
    window.navigator.splashscreen.hide();
    xhr.status();
  }, 500);
}

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
  session.rememberLogin().then(function() {
    if (/^\/$/.test(m.route()) && !triedToLogin) {
      triedToLogin = true;
      var nowPlaying = session.nowPlaying();
      if (nowPlaying.length)
        m.route('/play/' + nowPlaying[0].fullId);
      else
        window.plugins.toast.show(i18n('connectedToLichess'), 'short', 'center');
    }
  }, function(err) {
    if (/^\/$/.test(m.route()) && !triedToLogin) {
      // means user is anonymous here
      if (err.message === 'unauthorizedError') {
        triedToLogin = true;
        var lastPlayedAnon = storage.get('lastPlayedGameURLAsAnon');
        if (lastPlayedAnon)
          m.route('/play' + lastPlayedAnon);
        else {
          window.plugins.toast.show(i18n('connectedToLichess'), 'short', 'center');
          menu.open();
          m.redraw();
        }
      }
    }
  });
}

function handleError(event, source, fileno, columnNumber) {
  var description = event + ' at ' + source + ' [' + fileno + ', ' + columnNumber + ']';
  window.analytics.trackException(description, true);
}

window.onerror = handleError;

window.handleOpenURL = function(url) {
  setTimeout(function() {
    var gameId = url.match(/^lichess:\/\/(\w+)/)[1];
    if (gameId) m.route('/play/' + gameId);
  }, 0);
};

document.addEventListener('deviceready',
  // i18n must be loaded before any rendering happens
  utils.f(i18n.loadPreferredLanguage, main),
  false
);
