'use strict';

var ajax = require('./ajax'),
ko = require('knockout'),
session;

var userView = {
  name: ko.observable(),
  rating: ko.observable()
};

function trash() {
  session = null;
  userView.name(null);
  userView.rating(null);
}

function login(username, password) {
  return ajax({ url: '/login', method: 'POST', data: {
    username: username,
    password: password
  }}).then(function (data) {
    session = data;
    userView.name(data.username);
    userView.rating(data.rating);
    return session;
  });
}

function logout() {
  return ajax({ url: '/logout', method: 'GET' }, true).then(function (data) {
    trash();
    return null;
  }, function (error) {
    throw new Error(error.responseText);
  });
}

function isConnected() {
  return !!session;
}

function get() {
  return session;
}

function refresh() {
  return ajax({ url: '/account/info', method: 'GET'}).then(function (data) {
    session = data;
    userView.name(data.username);
    userView.rating(data.rating);
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
