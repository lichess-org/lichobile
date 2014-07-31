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
    ajax = require('./ajax'),
    StrongSocket = require('./socket'),
    utils = require('./utils'),
    Spinner = require('spin.js'),
    $ = utils.$;

function main() {

  var lobbySocket;

  document.body.addEventListener('submit', function (e) {
    e.preventDefault();
  });

  var view = {
    claimDraw: function() {
      signals.claimDraw.dispatch();
    },
    settings: settings,
    user: session.userView
  };
  ko.applyBindings(view);

  var currGame = storage.get('currentGame');

  if (currGame) {
    play.resume(currGame).done(function (game) {
      if (game && game.isFinished()) play.stop();
    });
  }

  // try to get session from cookie
  session.refresh()
  // trick to initialize parts of ui that depends on session data
  // it should not stay like that...
  .fin(function () {
    $('.signin-out').style.display = 'block';
    Zepto('.player-table').show();
  });

  Zepto('#settingsModal').tap(function (e) {
    e.preventDefault();
  });

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

    session.login(username, password).done(function(data) {
      console.log(data);
      $('#userModal').classList.remove('active');
    }, function (error) {
      console.log(error);
      // handle error
    });


    return false;
  });

  Zepto('#signout').tap(function (e) {
    e.preventDefault();
    session.logout();
    $('#userModal').classList.remove('active');
  });

  Zepto('#play-computer').tap(function (e) {
    e.preventDefault();
    $('#computerGameModal').classList.remove('active');
    play.startAI();
  });

  Zepto('#play-human').tap(function (e) {
    e.preventDefault();

    var spinner = new Spinner().spin($('#mainPage'));

    $('#humanGameModal').classList.remove('active');

    // open lobby connection
    lobbySocket = new StrongSocket(
      '/lobby/socket/v1',
      0,
      {
        options: { name: "lobby", debug: true },
        events: {
          redirect: function (id) {
            lobbySocket.destroy();
            spinner.stop();
            play.startHuman(id);
          }
        }
      }
    );

    // send a hook and wait for a fish...
    ajax({ url: '/setup/hook/' + utils.lichessSri, method: 'POST', data: {
      variant: settings.game.human.variant(),
      clock: settings.game.human.clock(),
      time: 5,
      increment: 2,
      mode: settings.game.human.mode()
    }}).then(function() {
      console.log('hook sent');
    }, function(err) {
      console.log('post request to lichess failed', err);
      spinner.stop();
    }).done();

  });

}

window.document.addEventListener(window.cordova ? 'deviceready' : 'DOMContentLoaded', main, false);
