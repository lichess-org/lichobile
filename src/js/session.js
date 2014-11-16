var utils = require('./utils');

var session = {};

session.controller = function() {

  this.session = null;

  this.isConnected = function() {
    return !!this.session;
  };

  this.login = function(username, password) {
    return m.request({
      url: window.apiEndPoint + '/login',
      method: 'POST',
      config: utils.xhrConfig,
      data: {
        username: username,
        password: password
      }
    }).then(function(data) {
      this.session = data;
    });
  };

  this.logout = function() {
    return m.request({
      url: window.apiEndPoint + '/logout',
      method: 'GET',
      config: utils.xhrConfig
    }).then(function() {
      this.session = null;
    }, function(error) {
      throw new Error(error.responseText);
    });
  };

  this.refresh = function() {
    return m.request({
      url: window.apiEndPoint + 'account/info',
      method: 'GET',
      config: utils.xhrConfig
    }).then(function(data) {
      this.session = data;
    });
  };
};

module.exports = session;
