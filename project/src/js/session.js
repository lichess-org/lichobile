var http = require('./http');
var utils = require('./utils');

var session = null;

function isConnected() {
  return !!session;
}

function get() {
  return session;
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

function refresh(isBackground) {
  return http.request('/account/info', {
    background: isBackground
  }).then(function(data) {
    session = data;
    return session;
  });
}

module.exports = {
  isConnected: isConnected,
  login: login,
  logout: logout,
  refresh: refresh,
  get: get
};
