import assign from 'lodash/object/assign';
import storage from './storage';
import StrongSocket from './StrongSocket';
import * as utils from './utils';
import * as xhr from './xhr';
import i18n from './i18n';
import friendsApi from './lichess/friends';
import challengesApi from './lichess/challenges';
import session from './session';
import signals from './signals';
import m from 'mithril';

var socketInstance;
var errorDetected = false;
var connectedWS = true;

var alreadyWarned = false;
var redrawOnDisconnectedTimeoutID;
var proxyFailTimeoutID;
const proxyFailMsg = 'The connection to lichess server has failed. If the problem is persistent this may be caused by proxy or network issues. In that case, we\'re sorry: lichess online features such as games, connected friends or challenges won\'t work.';

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

function createGame(url, version, receiveHandler, gameUrl, userTv) {
  errorDetected = false;
  destroy();
  const opts = {
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
            if (err.status === 401) {
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
  };
  if (userTv) opts.params = { userTv };
  socketInstance = new StrongSocket(url, version, opts);
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
  // default socket is useless when anon.
  if (utils.hasNetwork() && session.isConnected()) {
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
}

function onConnected() {
  const wasOff = !connectedWS;
  connectedWS = true;
  clearTimeout(proxyFailTimeoutID);
  clearTimeout(redrawOnDisconnectedTimeoutID);
  if (wasOff) m.redraw();
}

function onDisconnected() {
  const wasOn = connectedWS;
  connectedWS = false;
  if (wasOn) redrawOnDisconnectedTimeoutID = setTimeout(function() {
    m.redraw();
  }, 2000);
  if (wasOn && !alreadyWarned && !storage.get('donotshowproxyfailwarning')) proxyFailTimeoutID = setTimeout(() => {
    // check if disconnection lasts, it could mean a proxy prevents
    // establishing a tunnel
    if (utils.hasNetwork() && !connectedWS) {
      alreadyWarned = true;
      window.navigator.notification.alert(proxyFailMsg, function() {
        storage.set('donotshowproxyfailwarning', true);
      });
    }
  }, 20000);
}

document.addEventListener('deviceready', () => {
  document.addEventListener('pause', () => clearTimeout(proxyFailTimeoutID), false);
}, false);

signals.socket.connected.add(onConnected);
signals.socket.disconnected.add(onDisconnected);

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
  isConnected() {
    return connectedWS;
  },
  destroy
};
