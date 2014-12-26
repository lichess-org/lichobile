var StrongSocket = require('../StrongSocket');
var layout = require('./layout');
var menu = require('./menu');
var widgets = require('./_commonWidgets');
var gamesMenu = require('./gamesMenu');
var xhr = require('../xhr');

var lobbySocket;
var nbPlaying = 0;

var seek = {};

function makeLobbySocket(lobbyVersion) {

  return new StrongSocket(
    '/lobby/socket/v1',
    lobbyVersion, {
      options: { name: 'lobby', pingDelay: 2000 },
      events: {
        redirect: function(data) {
          m.route('/play' + data.url);
        },
        n: function(n) {
          var redraw = n !== nbPlaying;
          nbPlaying = n;
          if (redraw) m.redraw();
        },
        resync: function(nothing, socket) {
          xhr.lobby().then(function(data) {
            socket.reset(data.lobby.version);
          });
        }
      }
    }
  );
}

seek.controller = function () {

  xhr.lobby().then(function(data) {
    lobbySocket = makeLobbySocket(data.lobby.version);
  });

  return {
    onunload: function() {
      if (lobbySocket) {
        lobbySocket.destroy();
        lobbySocket = null;
      }
    }
  };
};

seek.view = function() {
  function overlays() {
    return [
      gamesMenu.view(),
      m('div.overlay', [
        m('div.content', [
          m('div', 'Seeking...'),
          m('br'),
          m('div', 'Online players: ' + nbPlaying)
        ])
      ])
    ];
  }

  return layout(widgets.header, widgets.board, widgets.empty, menu.view, overlays);
};

module.exports = seek;
