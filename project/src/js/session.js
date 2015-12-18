import { request } from './http';
import { hasNetwork, handleXhrError } from './utils';
import i18n from './i18n';
import settings from './settings';
import friendsApi from './lichess/friends';
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
  }
}

export default {
  isConnected,
  login,
  rememberLogin,
  logout,
  signup,
  refresh,
  get: getSession,
  getUserId,
  nowPlaying,
  myTurnGames
};
