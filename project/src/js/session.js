var http = require('./http');
var utils = require('./utils');
var i18n = require('./i18n');
var settings = require('./settings');

var session = null;

function isConnected() {
  return !!session;
}

function get() {
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
  return http.request('/login', {
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
  return http.request('/logout', {}, true).then(function() {
    session = null;
  }, function(err) {
    utils.handleXhrError(err);
    throw err;
  });
}

function signup(username, password) {
  return http.request('/signup', {
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

function rememberLogin() {
  return http.request('/account/info', {
    background: true
  }).then(function(data) {
    session = data;
    return data;
  });
}

function refresh() {
  return http.request('/account/info', {
    background: true
  }).then(function(data) {
    session = data;
    m.redraw();
    return session;
  }, function(err) {
    if (session && err.message === 'unauthorizedError') {
      session = null;
      m.redraw();
      window.plugins.toast.show(i18n('signedOut'), 'short', 'center');
    }
    throw err;
  });
}

module.exports = {
  isConnected: isConnected,
  login: login,
  rememberLogin: rememberLogin,
  logout: logout,
  signup: signup,
  refresh: refresh,
  get: get,
  getUserId: getUserId,
  nowPlaying: nowPlaying,
  myTurnGames: myTurnGames
};
