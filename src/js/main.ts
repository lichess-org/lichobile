/// <reference path="../dts/index.d.ts" />

'use strict';

import './polyfills';
import 'whatwg-fetch';

import * as Raven from 'raven-js'
import * as moment from 'moment';
window.moment = moment;

import { debounce } from 'lodash';
import { hasNetwork } from './utils';
import { syncWithNowPlayingGames } from './utils/offlineGames';
import redraw from './utils/redraw';
import session from './session';
import { loadPreferredLanguage } from './i18n';
import settings from './settings';
import * as xhr from './xhr';
import challengesApi from './lichess/challenges';
import * as helper from './ui/helper';
import router from './router';
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
  document.addEventListener('offline', onOffline, false);
  document.addEventListener('resume', onResume, false);
  document.addEventListener('pause', onPause, false);
  document.addEventListener('backbutton', router.backbutton, false);
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
    window.ga.startTrackerWithId(window.lichess.gaId);
  }

  if (window.lichess.mode === 'release' && window.lichess.sentryDSN) {
    Raven.config(window.lichess.sentryDSN, {
      release: window.AppVersion ? window.AppVersion.version : 'snapshot-dev'
    }).install()
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

      xhr.status();

      // pre fetch and cache available pools
      xhr.lobby();

      session.rememberLogin()
      .then(() => {
        push.register();
        challengesApi.refresh();
        redraw();
      })
      .then(session.nowPlaying)
      .then(syncWithNowPlayingGames)
      .then(() => xhr.setServerLang(settings.general.lang()))
      .catch(() => console.log('connected as anonymous'));

    } else {
      socket.connect();
      session.refresh();
    }
  }
}

function onOffline() {
  // offline event fires every time the network connection changes
  // it doesn't mean necessarily the network is off
  if (isForeground() && !hasNetwork()) {
    socket.disconnect();
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

document.addEventListener('deviceready',
  // i18n must be loaded before any rendering happens
  () => loadPreferredLanguage().then(main),
  false
);
