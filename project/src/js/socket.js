import assign from 'lodash/object/assign';
import StrongSocket from './StrongSocket';
import xhr from './xhr';
import i18n from './i18n';
import friends from './friends';

var defaultSocketInstance;
var socketInstance;
var errorDetected = false;

const defaultHandlers = {
  following_onlines: data => {
    friends.set(data);
    m.redraw();
  },
  following_enters: name => {
    friends.add(name);
    m.redraw();
  },
  following_leaves: name => {
    friends.remove(name);
    m.redraw();
  },
  challengeReminder: id => console.log(id)
};

function game(url, version, receiveHandler, gameUrl) {
  errorDetected = false;
  socketInstance = new StrongSocket(url, version, {
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
    events: defaultHandlers,
    receive: receiveHandler
  });

  return socketInstance;
}

function await(url, version, handlers) {
  socketInstance = new StrongSocket(
    url, version, {
      options: {
        name: 'await',
        debug: window.lichess.mode !== 'prod',
        ignoreUnknownMessages: true,
        pingDelay: 2000
      },
      events: assign({}, defaultHandlers, handlers)
    }
  );
  return socketInstance;
}

function lobby(lobbyVersion, onOpen, handlers) {
  socketInstance = new StrongSocket(
    '/lobby/socket/v1',
    lobbyVersion, {
      options: {
        name: 'lobby',
        debug: window.lichess.mode !== 'prod',
        ignoreUnknownMessages: true,
        pingDelay: 2000,
        onOpen: onOpen
      },
      events: assign({}, defaultHandlers, handlers)
    }
  );

  return socketInstance;
}

function connectDefault() {
  defaultSocketInstance = new StrongSocket(
    '/socket',
    0, {
      options: {
        name: 'persistent',
        debug: window.lichess.mode !== 'prod',
        pingDelay: 2000
      },
      events: defaultHandlers
    }
  );
}

function onPause() {
  if (socketInstance) socketInstance.destroy();
}

function onResume() {
  if (socketInstance) socketInstance.connect();
}

document.addEventListener('pause', onPause, false);
document.addEventListener('resume', onResume, false);

export default {
  game,
  lobby,
  await,
  connectDefault
};
