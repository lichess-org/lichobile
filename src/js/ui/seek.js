var StrongSocket = require('../StrongSocket');
var layout = require('./layout');
var menu = require('./menu');
var widgets = require('./_commonWidgets');
var gamesMenu = require('./gamesMenu');

var lobbySocket;
var nbPlaying = 0;

var seek = {};

function makeLobbySocket() {
  return new StrongSocket(
    '/lobby/socket/v1',
    0, {
      options: { name: 'lobby', pingDelay: 2000 },
      events: {
        redirect: function(data) {
          m.route('/play' + data.url);
        },
        n: function(n) {
          var redraw = n !== nbPlaying;
          nbPlaying = n;
          if (redraw) m.redraw();
        }
      }
    }
  );
}

seek.controller = function () {
  lobbySocket = makeLobbySocket();

  return {
    onunload: function() {
      lobbySocket.destroy();
      lobbySocket = null;
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
