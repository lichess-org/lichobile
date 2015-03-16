var StrongSocket = require('./StrongSocket');

var socketInstance;

function createGameSocket(url, version, receiveHandler) {
  socketInstance = new StrongSocket(url, version, {
    options: {
      name: 'game',
      debug: window.lichess.mode !== 'prod',
      ignoreUnknownMessages: true
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
        debug: window.lichess.mode !== 'prod',
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
