'use strict';

var ajax = require('./ajax'),
session;

function login(username, password) {
  return ajax({ url: '/login', method: 'POST', data: {
    username: username,
    password: password
  }}).then(function (data) {
    session = data;
    return session;
  });
}

function isAuthenticated() {
  return !!session;
}

function get() {
  return session;
}

function refresh() {
  return ajax({ url: '/account/info', method: 'GET'}).then(function (data) {
    session = data;
    return session;
  });
}

function trash() {
  session = null;
}

module.exports = {
  isAuthenticated: isAuthenticated,
  get: get,
  trash: trash,
  login: login,
  refresh: refresh
};
