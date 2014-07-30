/* lichess-mobile application entry point */

'use strict';

require('./knockoutExtend');

var play = require('./play'),
    alert = require('./alert'),
    Zepto = require('./vendor/zepto'),
    session = require('./session'),
    settings = require('./settings'),
    ko = require('knockout'),
    signals = require('./signals'),
    storage = require('./storage'),
    utils = require('./utils'),
    $ = utils.$;

function showUser(user) {
  $('#title').innerHTML = user.username + ' (' + user.rating + ')';
}

function main() {

  document.body.addEventListener('submit', function (e) {
    e.preventDefault();
  });

  // try to get session from cookie
  session.refresh().done(function (data) {
    showUser(data);
  });

  var view = {
    claimDraw: function() {
      signals.claimDraw.dispatch();
    },
    settings: settings
  };
  ko.applyBindings(view);

  var currGame = storage.get('currentGame');

  if (currGame) {
    play.resume(currGame).done(function (game) {
      if (game && game.isFinished()) play.closeConnection();
    });
  }

  $('#login').addEventListener('submit', function () {
    var usernameInput = $('#username');
    var passwordInput = $('#password');
    var username = usernameInput.value;
    var password = passwordInput.value;

    if (window.cordova && !utils.isConnected()) {
      alert.show(
        'danger',
        'No network connection detected.'
      );
      return false;
    }

    session.login(username, password).then(function(data) {
      console.log(data);
      showUser(data);
      $('#connectModal').classList.remove('active');
    }, function (error) {
      console.log(error);
      // handle error
    });


    return false;
  });

  Zepto('#play-button').tap(function (e) {
    e.preventDefault();
    $('#gameModal').classList.remove('active');
    play.start();
  });

  Zepto('#settingsModal').tap(function (e) {
    e.preventDefault();
  });

}

window.document.addEventListener(window.cordova ? 'deviceready' : 'DOMContentLoaded', main, false);
