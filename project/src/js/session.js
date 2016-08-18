import { get, set } from 'lodash/object';
import redraw from './utils/redraw';
import { fetchJSON, fetchText } from './http';
import { hasNetwork, handleXhrError } from './utils';
import i18n from './i18n';
import settings from './settings';
import friendsApi from './lichess/friends';
import pick from 'lodash/pick';
import mapValues from 'lodash/mapValues';
import throttle from 'lodash/throttle';

var session = null;

function isConnected() {
  return !!session;
}

function getSession() {
  return session;
}

function getUserId() {
  return (session && session.id) ? session.id : null;
}

function nowPlaying() {
  var np = session && session.nowPlaying || [];
  return np.filter(function(e) {
    return settings.game.supportedVariants.indexOf(e.variant.key) !== -1;
  });
}

function isKidMode() {
  return session && session.kid;
}

function myTurnGames() {
  return nowPlaying().filter(function(e) {
    return e.isMyTurn;
  });
}

function toggleKidMode() {
  return fetchText('/account/kidConfirm', {
    method: 'POST'
  });
}

function savePreferences() {

  function xhrConfig(xhr) {
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.withCredentials = true;
    xhr.timeout = 8000;
  }

  const prefs = mapValues(pick(session && session.prefs || {}, [
    'animation',
    'captured',
    'highlight',
    'destination',
    'coords',
    'replay',
    'blindfold',
    'clockTenths',
    'clockBar',
    'clockSound',
    'premove',
    'takeback',
    'autoQueen',
    'autoThreefold',
    'submitMove',
    'confirmResign',
    'follow',
    'challenge',
    'message',
    'insightShare'
  ]), v => {
    if (v === true) return 1;
    else if (v === false) return 0;
    else return v;
  });

  return fetchText('/account/preferences', {
    method: 'POST',
    body: new FormData(prefs)
  }, true, xhrConfig);
}

function lichessBackedProp(path, prefRequest) {
  return function() {
    if (arguments.length) {
      var oldPref;
      if (session) {
        oldPref = get(session, path);
        set(session, path, arguments[0]);
      }
      prefRequest()
      .catch(err => {
        if (session) set(session, path, oldPref);
        handleXhrError(err);
      });
    }

    return session && get(session, path);
  };
}

function login(username, password) {
  return fetchJSON('/login', {
    method: 'POST',
    body: JSON.stringify({
      username,
      password
    })
  }, true)
  .then(function(data) {
    session = data;
    return session;
  });
}

function logout() {
  return fetchJSON('/logout', {}, true)
  .then(function() {
    session = null;
    friendsApi.clear();
  })
  .catch(err => {
    handleXhrError(err);
    throw err;
  });
}

function signup(username, email, password) {
  return fetchJSON('/signup', {
    method: 'POST',
    body: JSON.stringify({
      username,
      email,
      password
    })
  }, true)
  .then(function(data) {
    session = data;
    return session;
  });
}

function rememberLogin() {
  return fetchJSON('/account/info')
  .then(data => {
    session = data;
    return data;
  });
}

function refresh() {
  if (hasNetwork() && isConnected()) {
    return fetchJSON('/account/info')
    .then(data => {
      session = data;
      redraw();
      return session;
    })
    .catch(err => {
      if (session && err.status === 401) {
        session = null;
        redraw();
        window.plugins.toast.show(i18n('signedOut'), 'short', 'center');
      }
      throw err;
    });
  } else {
    return Promise.resolve(false);
  }
}

export default {
  isConnected,
  isKidMode,
  logout,
  signup,
  login: throttle(login, 1000),
  rememberLogin: throttle(rememberLogin, 1000),
  refresh: throttle(refresh, 1000),
  savePreferences: throttle(savePreferences, 1000),
  get: getSession,
  getUserId,
  nowPlaying,
  myTurnGames,
  lichessBackedProp,
  toggleKidMode
};
