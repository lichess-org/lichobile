/* application entry point */

// require mithril globally for convenience
window.m = require('mithril');
// for moment a global object makes loading locales easier
window.moment = require('moment');

var utils = require('./utils');
var session = require('./session');
var i18n = require('./i18n');
var xhr = require('./xhr');
var backbutton = require('./backbutton');
var storage = require('./storage');
var routes = require('./routes');
import socket from './socket';

var triedToLogin = false;

var refreshInterval = 60000 * 2; // 2 minutes refresh polling
var refreshIntervalID;

function main() {
  routes.init();

  // open games from external links with url scheme (lichess://gameId)
  window.handleOpenURL = function(url) {
    setTimeout(function() {
      var parsed = url.match(/^lichess:\/\/(\w+)\/?(black|white)?/);
      var gameId = parsed[1];
      var color = parsed[2];
      if (!gameId) return;
      var route = '/game/' + gameId;
      if (color) route += ('/' + color);
      m.route(route);
    }, 0);
  };

  // pull session data once (to log in user automatically thanks to cookie)
  // and also listen to online event in case network was disconnected at app
  // startup
  if (utils.hasNetwork())
    onOnline();
  else {
    window.navigator.notification.alert(i18n('noInternetConnection'));
  }

  refreshIntervalID = setInterval(refresh, refreshInterval);

  document.addEventListener('online', onOnline, false);
  document.addEventListener('offline', onOffline, false);
  document.addEventListener('resume', onResume, false);
  document.addEventListener('pause', onPause, false);
  document.addEventListener('backbutton', backbutton, false);

  // iOs keyboard hack
  // TODO we may want to remove this and call only on purpose
  window.cordova.plugins.Keyboard.disableScroll(true);

  if (window.lichess.gaId) window.analytics.startTrackerWithId(window.lichess.gaId);

  setTimeout(function() {
    window.navigator.splashscreen.hide();
    xhr.status();
  }, 200);
}

function refresh() {
  if (utils.hasNetwork() && session.isConnected()) session.refresh();
}

function onResume() {
  refresh();
  refreshIntervalID = setInterval(refresh, refreshInterval);
  socket.connect();
}

function onPause() {
  clearInterval(refreshIntervalID);
  socket.disconnect();
}

function onOnline() {
  session.rememberLogin().then(() => {
    if (/^\/$/.test(m.route()) && !triedToLogin) {
      triedToLogin = true;
      var nowPlaying = session.nowPlaying();
      if (nowPlaying.length)
        m.route('/game/' + nowPlaying[0].fullId);
      else
        socket.createDefault();
      window.plugins.toast.show(i18n('connectedToLichess'), 'short', 'center');
    }
  }, err => {
    if (/^\/$/.test(m.route()) && !triedToLogin) {
      // means user is anonymous here
      if (err.message === 'unauthorizedError') {
        triedToLogin = true;
        var lastPlayedAnon = storage.get('lastPlayedGameURLAsAnon');
        if (lastPlayedAnon) m.route('/game' + lastPlayedAnon);
        window.plugins.toast.show(i18n('connectedToLichess'), 'short', 'center');
      }
    }
  })
  .then(m.redraw);
}

function onOffline() {
  m.redraw();
}

function handleError(event, source, fileno, columnNumber) {
  var description = event + ' at ' + source + ' [' + fileno + ', ' + columnNumber + ']';
  window.analytics.trackException(description, true);
}

window.onerror = handleError;

document.addEventListener('deviceready',
  // i18n must be loaded before any rendering happens
  () => i18n.loadPreferredLanguage().then(main),
  false
);
