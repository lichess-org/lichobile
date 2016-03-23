import { request } from './http';
import { hasNetwork, handleXhrError, noop, serializeQueryParameters } from './utils';
import i18n from './i18n';
import settings from './settings';
import friendsApi from './lichess/friends';
import pick from 'lodash/pick';
import mapValues from 'lodash/mapValues';
import throttle from 'lodash/throttle';
import m from 'mithril';

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

function myTurnGames() {
  return nowPlaying().filter(function(e) {
    return e.isMyTurn;
  });
}

function savePreferences() {

  function xhrConfig(xhr) {
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.withCredentials = true;
    xhr.timeout = 8000;
  }

  const prefs = mapValues(pick(session.prefs || {}, [
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

  return request('/account/preferences', {
    method: 'POST',
    data: serializeQueryParameters(prefs),
    serialize: v => v,
    deserialize: v => v
  }, true, xhrConfig);
}

function lichessBackedProp(key) {
  return function() {
    if (arguments.length) {
      if (session) {
        var oldPref = session.prefs[key];
        session.prefs[key] = arguments[0];
      }
      savePreferences()
      .then(noop, err => {
        if (session) session.prefs[key] = oldPref;
        handleXhrError(err);
        // need to do this to force mithril to correctly render checkbox state
        m.redraw.strategy('all');
        m.redraw();
      });
    }

    return session && session.prefs[key];
  };
}

function login(username, password) {
  return request('/login', {
    method: 'POST',
    data: {
      username: username,
      password: password
    }
  }, true).then(function(data) {
    session = data;
    return session;
  });
}

function logout() {
  return request('/logout', {}, true).then(function() {
    session = null;
    friendsApi.clear();
  }, function(err) {
    handleXhrError(err);
    throw err;
  });
}

function signup(username, email, password) {
  return request('/signup', {
    method: 'POST',
    data: {
      username,
      email,
      password
    }
  }, true).then(function(data) {
    session = data;
    return session;
  });
}

function rememberLogin() {
  return request('/account/info', {
    background: true
  }).then(function(data) {
    session = data;
    return data;
  });
}

function refresh() {
  if (hasNetwork() && isConnected()) {
    return request('/account/info', {
      background: true
    }).then(function(data) {
      session = data;
      m.redraw();
      return session;
    }, function(err) {
      if (session && err.status === 401) {
        session = null;
        m.redraw();
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
  lichessBackedProp
};
