var StrongSocket = require('./StrongSocket');
var xhr = require('./xhr');
var i18n = require('./i18n');

var gameSocket, lobbySocket;

var errorDetected = false;

function createGameSocket(url, version, receiveHandler, gameUrl) {
  errorDetected = false;
  gameSocket = new StrongSocket(url, version, {
    options: {
      name: 'game',
      debug: window.lichess.mode !== 'prod',
      ignoreUnknownMessages: true,
      onError: function() {
        // we can't get socket error, so we send an xhr to test whether the
        // rejection is an authorization issue
        if (!errorDetected) {
          // just to be sure that we don't send an xhr every second when the
          // websocket is trying to reconnect
          errorDetected = true;
          xhr.game(gameUrl.substring(1)).then(function() {}, function(err) {
            if (err.message === 'unauthorizedError') {
              window.plugins.toast.show(i18n('unauthorizedError'), 'short', 'center');
              m.route('/');
            }
          });
        }
      }
    },
    receive: receiveHandler
  });

  return gameSocket;
}

function createAwaitSocket(url, version, handlers) {
  gameSocket = new StrongSocket(
    url, version, {
      options: {
        name: 'await',
        debug: window.lichess.mode !== 'prod',
        ignoreUnknownMessages: true,
        pingDelay: 2000
      },
      events: handlers
    }
  );
  return gameSocket;
}

function createLobbySocket(lobbyVersion, onOpen, handlers) {
  lobbySocket = new StrongSocket(
    '/lobby/socket/v1',
    lobbyVersion, {
      options: {
        name: 'lobby',
        debug: window.lichess.mode !== 'prod',
        ignoreUnknownMessages: true,
        pingDelay: 2000,
        onOpen: onOpen
      },
      events: handlers
    }
  );

  return lobbySocket;
}

function onPause() {
  if (gameSocket) gameSocket.destroy();
  if (lobbySocket) lobbySocket.destroy();
}

function onResume() {
  if (gameSocket) gameSocket.connect();
  if (lobbySocket) lobbySocket.connect();
}

document.addEventListener('pause', onPause, false);
document.addEventListener('resume', onResume, false);

module.exports = {
  connectGame: createGameSocket,
  connectLobby: createLobbySocket,
  await: createAwaitSocket
};
