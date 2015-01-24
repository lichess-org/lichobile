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
  return http.request('/logout').then(function() {
    session = null;
  }, function(err) {
    utils.handleXhrError(err);
    throw err;
  });
}

function rememberLogin() {
  return http.request('/account/info', {
    background: true
  }).then(function(data) {
    session = data;
    m.redraw();
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
    if (err.message === 'unauthorizedError') {
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
  refresh: refresh,
  get: get,
  nowPlaying: nowPlaying,
  myTurnGames: myTurnGames
};
