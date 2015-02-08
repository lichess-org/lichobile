var StrongSocket = require('./StrongSocket');
var session = require('./session');
var i18n = require('./i18n');

var socketInstance;

function createGameSocket(url, version, receiveHandler) {
  socketInstance = new StrongSocket(url, version, {
    options: {
      name: "game",
      debug: true,
      ignoreUnknownMessages: true,
      onError: function() {
        // TODO find a way to get the real error
        // for now we assume it comes from opening a user game while logged out
        if (!session.isConnected()) {
          window.plugins.toast.show(i18n('unauthorizedError'), 'short', 'center');
          m.route('/');
        }
      }
    },
    receive: receiveHandler
  });

  return socketInstance;
}

function createLobbySocket(lobbyVersion, onOpen, handlers) {
  socketInstance = new StrongSocket(
    '/lobby/socket/v1',
    lobbyVersion, {
      options: {
        name: 'lobby',
        pingDelay: 2000,
        onOpen: onOpen
      },
      events: handlers
    }
  );

  return socketInstance;
}


function onPause() {
  if (socketInstance) socketInstance.destroy();
}

function onResume() {
  if (socketInstance) socketInstance.connect();
}

document.addEventListener('pause', onPause, false);
document.addEventListener('resume', onResume, false);

module.exports = {
  connectGame: createGameSocket,
  connectLobby: createLobbySocket
};
