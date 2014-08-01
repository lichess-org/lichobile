'use strict';

var ajax = require('./ajax'),
ko = require('knockout'),
session;

var userView = {
  name: ko.observable(),
  rating: ko.observable(),
  isConnected: ko.observable(false)
};

function isConnected() {
  return !!session;
}

function trash() {
  session = null;
  userView.name(null);
  userView.rating(null);
  userView.isConnected(isConnected());
}

function login(username, password) {
  return ajax({ url: '/login', method: 'POST', data: {
    username: username,
    password: password
  }}).then(function (data) {
    session = data;
    userView.name(data.username);
    userView.rating(data.rating);
    userView.isConnected(isConnected());
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
    userView.name(data.username);
    userView.rating(data.rating);
    userView.isConnected(isConnected());
    return session;
  });
}

module.exports = {
  isConnected: isConnected,
  get: get,
  trash: trash,
  login: login,
  logout: logout,
  refresh: refresh,
  userView: userView
};
