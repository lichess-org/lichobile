/* application entry point */

import './polyfills';

// for moment a global object makes loading locales easier
import moment from 'moment';
window.moment = moment;

import m from 'mithril';
import * as utils from './utils';
import session from './session';
import i18n, { loadPreferredLanguage } from './i18n';
import settings from './settings';
import { status as xhrStatus, setServerLang } from './xhr';
import helper from './ui/helper';
import backbutton from './backbutton';
import storage from './storage';
import socket from './socket';
import push from './push';
import routes from './routes';

var triedToLogin = false;

function main() {

  routes.init();

  // open games from external links with url scheme
  window.handleOpenURL = function(url) {
    setTimeout(onUrlOpen.bind(undefined, url), 0);
  };

  // iOs needs this to auto-rotate
  window.shouldRotateToOrientation = function() {
    return true;
  };

  // pull session data once (to log in user automatically thanks to cookie)
  // and also listen to online event in case network was disconnected at app
  // startup
  if (utils.hasNetwork())
    onOnline();
  else {
    window.plugins.toast.show(i18n('noInternetConnection'), 'short', 'center');
  }

  document.addEventListener('online', onOnline, false);
  document.addEventListener('offline', onOffline, false);
  document.addEventListener('resume', onResume, false);
  document.addEventListener('pause', onPause, false);
  document.addEventListener('backbutton', backbutton, false);
  window.addEventListener('resize', onResize, false);

  // iOs keyboard hack
  // TODO we may want to remove this and call only on purpose
  window.cordova.plugins.Keyboard.disableScroll(true);

  if (window.lichess.gaId) window.analytics.startTrackerWithId(window.lichess.gaId);

  // leave time to the screen to render fully
  setTimeout(function() {
    window.navigator.splashscreen.hide();
    xhrStatus();
  }, 500);
}

function onUrlOpen(url) {
  const uris = [
    {
      reg: /^lichess:\/\/training\/(\d+)/,
      ctrl: (id) => m.route(`/training/${id}`)
    },
    {
      reg: /^lichess:\/\/(\w+)\/?(black|white)?/,
      ctrl: (gameId, color) => {
        let route = '/game/' + gameId;
        if (color) route += ('/' + color);
        m.route(route);
      }
    }
  ];
  for (var i = 0; i <= uris.length; i++) {
    const r = uris[i];
    const parsed = r.reg.exec(url);
    if (parsed !== null) {
      r.ctrl.apply(null, parsed.slice(1));
      break;
    }
  }
}

function onResize() {
  helper.cachedViewportDim = null;
  m.redraw();
}

function onOnline() {
  session.rememberLogin().then(() => {
    // first time login on app start or just try to reconnect socket
    if (/^\/$/.test(m.route()) && !triedToLogin) {
      triedToLogin = true;
      var nowPlaying = session.nowPlaying();
      if (nowPlaying.length)
        m.route('/game/' + nowPlaying[0].fullId);
      else
        socket.createDefault();
      window.plugins.toast.show(i18n('connectedToLichess'), 'short', 'center');
    } else {
      socket.connect();
    }
  }, err => {
    if (/^\/$/.test(m.route()) && !triedToLogin) {
      // means user is anonymous here
      if (err.status === 401) {
        triedToLogin = true;
        var lastPlayedAnon = storage.get('lastPlayedGameURLAsAnon');
        if (lastPlayedAnon) m.route('/game' + lastPlayedAnon);
      }
    }
  })
  .then(m.redraw)
  .then(push.register)
  .then(() => setServerLang(settings.general.lang()));
}

function onOffline() {
  socket.disconnect();
  m.redraw();
}

function onResume() {
  socket.connect();
}

function onPause() {
  socket.disconnect();
}

function handleError(event, source, fileno, columnNumber) {
  var description = event + ' at ' + source + ' [' + fileno + ', ' + columnNumber + ']';
  window.analytics.trackException(description, true);
}

window.onerror = handleError;

document.addEventListener('deviceready',
  // i18n must be loaded before any rendering happens
  () => loadPreferredLanguage().then(main),
  false
);
