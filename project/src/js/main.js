/* application entry point */

import './polyfills';

// for moment a global object makes loading locales easier
import moment from 'moment';
window.moment = moment;

import m from 'mithril';
import * as utils from './utils';
import session from './session';
import { loadPreferredLanguage } from './i18n';
import settings from './settings';
import { status as xhrStatus, setServerLang } from './xhr';
import challengesApi from './lichess/challenges';
import timeline from './lichess/timeline';
import helper from './ui/helper';
import backbutton from './backbutton';
import socket from './socket';
import push from './push';
import routes from './routes';
import deepLinks from './deepLinks';

var triedToLogin = false;

function main() {

  routes.init();
  deepLinks.init();

  // cache viewport dims
  helper.viewportDim();

  // iOs needs this to auto-rotate
  window.shouldRotateToOrientation = function() {
    return true;
  };

  // init timeline last read to avoid reading too much localstorage
  timeline.setLastRead(timeline.getSavedLastRead());

  // pull session data once (to log in user automatically thanks to cookie)
  // and also listen to online event in case network was disconnected at app
  // startup
  if (utils.hasNetwork()) {
    onOnline();
  }

  document.addEventListener('online', onOnline, false);
  document.addEventListener('offline', onOffline, false);
  document.addEventListener('resume', onResume, false);
  document.addEventListener('pause', onPause, false);
  document.addEventListener('backbutton', backbutton, false);
  window.addEventListener('unload', function() {
    socket.destroy();
    socket.terminate();
  });
  window.addEventListener('resize', onResize, false);

  // iOs keyboard hack
  // TODO we may want to remove this and call only on purpose
  window.cordova.plugins.Keyboard.disableScroll(true);
  window.cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);

  if (window.lichess.gaId) window.analytics.startTrackerWithId(window.lichess.gaId);

  // leave time to the screen to render fully
  setTimeout(function() {
    window.navigator.splashscreen.hide();
    xhrStatus();
  }, 500);
}

function onResize() {
  helper.cachedViewportDim = null;
  m.redraw();
}

function onOnline() {
  session.rememberLogin().then(() => {
    // load timeline
    timeline.refresh();
    // load challenges
    challengesApi.refresh();
    // first time login on app start or just try to reconnect socket
    if (!triedToLogin) {
      triedToLogin = true;
    } else {
      socket.connect();
    }
  }, err => {
    if (!triedToLogin) {
      // means user is anonymous here
      if (err.status === 401) {
        triedToLogin = true;
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
  timeline.refresh().then(v => {
    if (v) m.redraw();
  });
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
