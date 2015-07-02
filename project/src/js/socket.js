import assign from 'lodash/object/assign';
import StrongSocket from './StrongSocket';
import * as utils from './utils';
import * as xhr from './xhr';
import i18n from './i18n';
import friendsApi from './lichess/friends';
import challengesApi from './lichess/challenges';
import m from 'mithril';

var socketInstance;
var errorDetected = false;

const defaultHandlers = {
  following_onlines: data => utils.autoredraw(utils.partialf(friendsApi.set, data)),
  following_enters: name => utils.autoredraw(utils.partialf(friendsApi.add, name)),
  following_leaves: name => utils.autoredraw(utils.partialf(friendsApi.remove, name)),
  challengeReminder: o => {
    if (challengesApi.hasKey(o.id)) challengesApi.remind(o.id);
    else xhr.getChallenge(o.id).then(g => challengesApi.add(o.id, g)).then(m.redraw);
  }
};

function destroy() {
  if (socketInstance) {
    socketInstance.destroy();
    socketInstance = null;
  }
}

function createGame(url, version, receiveHandler, gameUrl) {
  errorDetected = false;
  destroy();
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
      },
      onOpen: () => socketInstance.send('following_onlines')
    },
    events: defaultHandlers,
    receive: receiveHandler
  });
}

function createAwait(url, version, handlers) {
  destroy();
  socketInstance = new StrongSocket(
    url, version, {
      options: {
        name: 'await',
        debug: window.lichess.mode !== 'prod',
        ignoreUnknownMessages: true,
        pingDelay: 2000,
        onOpen: () => socketInstance.send('following_onlines')
      },
      events: assign({}, defaultHandlers, handlers)
    }
  );
}

function createLobby(lobbyVersion, onOpen, handlers) {
  destroy();
  socketInstance = new StrongSocket(
    '/lobby/socket/v1',
    lobbyVersion, {
      options: {
        name: 'lobby',
        debug: window.lichess.mode !== 'prod',
        ignoreUnknownMessages: true,
        pingDelay: 2000,
        onOpen: () => {
          onOpen();
          socketInstance.send('following_onlines');
        }
      },
      events: assign({}, defaultHandlers, handlers)
    }
  );
}

function createDefault() {
  destroy();
  socketInstance = new StrongSocket(
    '/socket', 0, {
      options: {
        name: 'default',
        debug: window.lichess.mode !== 'prod',
        pingDelay: 2000,
        onOpen: () => socketInstance.send('following_onlines')
      },
      events: defaultHandlers
    }
  );
}

export default {
  createGame,
  createLobby,
  createAwait,
  createDefault,
  setVersion(version) {
    if (socketInstance) socketInstance.setVersion(version);
  },
  getAverageLag() {
    if (socketInstance) return socketInstance.averageLag;
  },
  send(...args) {
    if (socketInstance) socketInstance.send(...args);
  },
  connect() {
    if (socketInstance) socketInstance.connect();
  },
  disconnect() {
    if (socketInstance) socketInstance.destroy();
  },
  destroy
};
