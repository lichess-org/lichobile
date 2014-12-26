var utils = require('../utils');
var StrongSocket = require('../StrongSocket');
var layout = require('./layout');
var menu = require('./menu');
var widgets = require('./_commonWidgets');
var gamesMenu = require('./gamesMenu');
var i18n = require('../i18n');
var xhr = require('../xhr');
var i18n = require('../i18n');

var nbPlaying = 0;

var seek = {};

function makeLobbySocket(lobbyVersion) {
  return new StrongSocket(
    '/lobby/socket/v1',
    lobbyVersion, {
      options: {
        name: 'lobby',
        pingDelay: 2000
      },
      events: {
        redirect: function(data) {
          m.route('/play' + data.url);
        },
        n: function(n) {
          nbPlaying = n ? n : 0;
          m.redraw();
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

seek.controller = function() {

  var id = m.route.param('id');
  var lobbySocket;

  xhr.lobby().then(function(data) {
    lobbySocket = makeLobbySocket(data.lobby.version);
  });

  return {
    cancel: function() {
      if (lobbySocket)
        lobbySocket.send('cancel', id);
      m.route('/');
    },
    onunload: function() {
      if (lobbySocket) {
        lobbySocket.destroy();
        lobbySocket = null;
      }
    }
  };
};

seek.view = function(ctrl) {
  function overlays() {
    return [
      gamesMenu.view(),
      m('div.overlay', [
        m('div.content', [
          m('div', i18n('waitingForOpponent')),
          m('br'),
          m('div', i18n('nbConnectedPlayers', nbPlaying || '?')),
          m('br'),
          m('br'),
          m('a', {
            config: utils.ontouchend(ctrl.cancel),
          }, i18n('cancel'))
        ])
      ])
    ];
  }

  return layout(widgets.header, widgets.board, widgets.empty, menu.view, overlays);
};

module.exports = seek;
