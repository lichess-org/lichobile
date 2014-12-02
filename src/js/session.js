var utils = require('./utils');

var session = null;

function isConnected() {
  return !!session;
}

function get() {
  return session;
}

function login(username, password) {
  return m.request({
    url: window.apiEndPoint + '/login',
    method: 'POST',
    config: utils.xhrConfig,
    data: {
      username: username,
      password: password
    }
  }).then(function(data) {
    session = data;
  }, function(error) {
    console.log(error);
  });
}

function logout() {
  return m.request({
    url: window.apiEndPoint + '/logout',
    method: 'GET',
    config: utils.xhrConfig,
    deserialize: function(value) { return value; }
  }).then(function() {
    session = null;
  }, function(error) {
    console.log(error);
  });
}

function refresh() {
  return m.request({
    url: window.apiEndPoint + '/account/info',
    method: 'GET',
    config: utils.xhrConfig
  }).then(function(data) {
    session = data;
  }, function(error) {
    console.log(error);
  });
}

module.exports = {
  isConnected: isConnected,
  login: login,
  logout: logout,
  refresh: refresh,
  get: get
};
