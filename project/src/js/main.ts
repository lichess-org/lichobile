/// <reference path="../dts/cordova/cordova.d.ts" />
/// <reference path="../dts/cordova-ionic/cordova-ionic.d.ts" />
/// <reference path="../dts/cordova-plugin-toast.d.ts" />
/// <reference path="../dts/cordova-plugin-insomnia.d.ts" />
/// <reference path="../dts/cordova-plugin-socialsharing.d.ts" />
/// <reference path="../dts/mithril.d.ts" />
/// <reference path="../dts/lodash.d.ts" />
/// <reference path="../dts/sse.d.ts" />
/// <reference path="../dts/lichess.d.ts" />
/// <reference path="../dts/chessground.d.ts" />
/// <reference path="../dts/whatwg-fetch.d.ts" />
/// <reference path="../dts/rlite.d.ts" />
/// <reference path="../dts/stockfish.d.ts" />
/// <reference path="../dts/zanimo.d.ts" />
/// <reference path="../dts/signals.d.ts" />
/// <reference path="../dts/misc.d.ts" />

'use strict';

import './polyfills';
import 'whatwg-fetch';

// for moment a global object makes loading locales easier
import * as moment from 'moment';
window.moment = moment;

import { debounce } from 'lodash';
import { hasNetwork } from './utils';
import { syncWithNowPlayingGames } from './utils/offlineGames';
import redraw from './utils/redraw';
import session from './session';
import { loadPreferredLanguage } from './i18n';
import settings from './settings';
import { status as xhrStatus, setServerLang } from './xhr';
import challengesApi from './lichess/challenges';
import * as helper from './ui/helper';
import backbutton from './backbutton';
import socket from './socket';
import push from './push';
import routes from './routes';
import deepLinks from './deepLinks';
import { isForeground, setForeground, setBackground } from './utils/appMode';

let firstConnection = true;

function main() {

  routes.init();
  deepLinks.init();

  // cache viewport dims
  helper.viewportDim();

  // iOs needs this to auto-rotate
  window.shouldRotateToOrientation = function() {
    return true;
  };

  // pull session data once (to log in user automatically thanks to cookie)
  // and also listen to online event in case network was disconnected at app
  // startup
  if (hasNetwork()) {
    onOnline();
  }

  document.addEventListener('online', onOnline, false);
  document.addEventListener('resume', onResume, false);
  document.addEventListener('pause', onPause, false);
  document.addEventListener('backbutton', backbutton, false);
  window.addEventListener('unload', function() {
    socket.destroy();
    socket.terminate();
  });
  window.addEventListener('resize', debounce(onResize), false);

  // iOs keyboard hack
  // TODO we may want to remove this and call only on purpose
  window.cordova.plugins.Keyboard.disableScroll(true);
  window.cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);

  if (window.lichess.gaId) {
    window.analytics.startTrackerWithId(window.lichess.gaId);
  }

  if (cordova.platformId === 'android') {
      window.StatusBar.backgroundColorByHexString('#151A1E');
  }

  setTimeout(function() {
    window.navigator.splashscreen.hide();
  }, 500);
}

function onResize() {
  helper.clearCachedViewportDim();
  redraw();
}

function onOnline() {
  if (isForeground()) {
    if (firstConnection) {

      firstConnection = false;

      xhrStatus();

      session.rememberLogin()
      .then(() => {
        push.register();
        challengesApi.refresh();
        redraw();
      })
      .then(session.nowPlaying)
      .then(syncWithNowPlayingGames)
      .then(() => setServerLang(settings.general.lang()))
      .catch(() => console.log('connected as anonymous'));

    } else {
      socket.connect();
      session.refresh();
    }
  }
}

function onResume() {
  setForeground();
  socket.connect();
}

function onPause() {
  setBackground();
  socket.disconnect();
}

function handleError(event: string, source: string, fileno: number, columnNumber: number) {
  const description = event + ' at ' + source + ' [' + fileno + ', ' + columnNumber + ']';
  window.analytics.trackException(description, true);
}

window.onerror = handleError;

document.addEventListener('deviceready',
  // i18n must be loaded before any rendering happens
  () => loadPreferredLanguage().then(main),
  false
);
