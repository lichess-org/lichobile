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
    render = require('./render'),
    $ = utils.$;

function main() {

  var lobbySocket;

  document.body.addEventListener('submit', function (e) {
    e.preventDefault();
  });

  document.addEventListener('backbutton', function (e) {
    var $active = Zepto('.modal.active');
    if ($active.length > 0) {
      e.preventDefault();
      $active.removeClass('active');
    } else {
      window.navigator.app.exitApp();
    }
  }, false);

  var view = {
    claimDraw: function() {
      signals.claimDraw.dispatch();
    },
    settings: settings,
    isConnected: session.isConnectedObs
  };
  ko.applyBindings(view);

  var currGame = storage.get('currentGame');

  if (currGame) {
    ajax({ url: currGame, method: 'GET'}).then(function(data) {
      if (!data.game.finished) play.resume(data);
    });
  }

  // try to get session from cookie
  session.refresh()
  // trick to initialize parts of ui that depends on session data
  // it should not stay like that...
  .fin(function () {
    $('.signin-out').style.display = 'block';
  });

  Zepto('#settingsModal').tap(function (e) {
    e.preventDefault();
  });

  $('#login').addEventListener('submit', function () {
    var usernameInput = $('#username');
    var passwordInput = $('#password');
    var username = usernameInput.value;
    var password = passwordInput.value;

    if (window.cordova && !utils.hasNetwork()) {
      alert.show(
        'danger',
        'No network connection detected.'
      );
      return false;
    }

    session.login(username, password).then(function() {
      $('#userModal').classList.remove('active');
    }, function (error) {
      console.log(error);
      if (error.status === 401) {
        $('#userModal').classList.remove('active');
        alert.show('danger', 'could not connect: ' + error.responseText);
      }
    }).done();


    return false;
  });

  Zepto('#signout').tap(function (e) {
    e.preventDefault();
    session.logout();
    $('#userModal').classList.remove('active');
  });

  Zepto('#play-icon').tap(function (e) {
    e.preventDefault();
    render.showOverlay('#playOverlay');
  });

  Zepto('#play-computer').tap(function (e) {
    e.preventDefault();
    render.hideOverlay('#playOverlay');
    $('#computerGameModal').classList.remove('active');
    play.startAI();
  });

  Zepto('#play-human').tap(function (e) {
    e.preventDefault();

    render.hideOverlay('#playOverlay');
    alert.hideAll();
    play.reset();

    render.showOverlay('#seekOverlay');

    // open lobby connection
    lobbySocket = new StrongSocket(
      '/lobby/socket/v1',
      0,
      {
        options: { name: "lobby", pingDelay: 2000, debug: false },
        events: {
          redirect: function (data) {
            lobbySocket.destroy();
            render.hideOverlay('#seekOverlay');
            play.startHuman(data.url).done();
          },
          n: function (e) {
            $('#online-players').innerHTML = e;
          }
        }
      }
    );

    var timePreset = settings.game.human.timePreset().split(',');

    // send a hook and wait for a fish...
    ajax({ url: '/setup/hook/' + utils.lichessSri, method: 'POST', data: {
      variant: settings.game.human.variant(),
      clock: settings.game.human.clock(),
      color: 'random',
      time: timePreset[0],
      increment: timePreset[1],
      mode: session.isConnected() ? settings.game.human.mode() : '0'
    }}, true).then(function () {
      console.log('hook sent');
    }, function () {
      render.hideOverlay('#seekOverlay');
    }).done();

    $('#humanGameModal').classList.remove('active');
  });

  Zepto('#cancel-seek').tap(function (e) {
    e.preventDefault();
    lobbySocket.destroy();
    render.hideOverlay('#seekOverlay');
  });

  Zepto('.cancel-overlay').tap(function () {
    render.hideOverlay();
  });

}

window.document.addEventListener(window.cordova ? 'deviceready' : 'DOMContentLoaded', main, false);
