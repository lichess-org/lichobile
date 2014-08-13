'use strict';

var ajax = require('./ajax'),
ko = require('knockout'),
session;

function isConnected() {
  return !!session;
}

var isConnectedObs = ko.observable(isConnected());

function trash() {
  session = null;
  isConnectedObs(isConnected());
}

function login(username, password) {
  return ajax({ url: '/login', method: 'POST', data: {
    username: username,
    password: password
  }}).then(function (data) {
    session = data;
    isConnectedObs(isConnected());
    return session;
  });
}

function logout() {
  return ajax({ url: '/logout', method: 'GET' }, true).then(function () {
    trash();
    return null;
  }, function (error) {
    throw new Error(error.responseText);
  });
}

function get() {
  return session;
}

function refresh() {
  return ajax({ url: '/account/info', method: 'GET'}).then(function (data) {
    session = data;
    isConnectedObs(isConnected());
    return session;
  });
}

module.exports = {
  isConnected: isConnected,
  isConnectedObs: isConnectedObs,
  get: get,
  trash: trash,
  login: login,
  logout: logout,
  refresh: refresh
};
