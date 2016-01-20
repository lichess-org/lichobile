import assign from 'lodash/object/assign';
import storage from './storage';
import * as utils from './utils';
import * as xhr from './xhr';
import i18n from './i18n';
import friendsApi from './lichess/friends';
import challengesApi from './lichess/challenges';
import session from './session';
import work from 'webworkify';
import m from 'mithril';

const socketWorker = work(require('./socketWorker'));

var socketHandlers;
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

socketWorker.onMessage = function(msg) {
  switch (msg.topic) {
    case 'onOpen':
      if (socketHandlers.onOpen) socketHandlers.onOpen();
      break;
    case 'disconnected': onDisconnected();
      break;
    case 'connected': onConnected();
      break;
    case 'onError':
      if (socketHandlers.onError) socketHandlers.onError();
      break;
    case 'handle':
      if (!socketHandlers.receive || !socketHandlers.receive(msg.data.t, msg.data.d)) {
        var h = self.settings.events[msg.data.t];
        if (h) h(msg.data.d || null);
        // else if (!self.options.ignoreUnknownMessages) {
        //   self.debug('Message not supported ' + JSON.stringify(msg));
        // }
      }
      break;
    case 'averageLag':
      if (socketHandlers.getAverageLagCallback) {
        socketHandlers.getAverageLagCallback(msg.data);
        socketHandlers.getAverageLagCallback = null;
      }
      break;
    default:
      throw new Error('socket topic not supported');
  }
};

function destroy() {
  socketWorker.postMessage({ topic: 'destroy' });
}

function createGame(url, version, receiveHandler, gameUrl, userTv) {
  errorDetected = false;
  destroy();
  socketHandlers = {
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
    events: defaultHandlers,
    receive: receiveHandler
  };
  const opts = {
    options: {
      name: 'game',
      debug: 'false',
      sendOnOpen: 'following_onlines'
    }
  };
  if (userTv) opts.params = { userTv };
  socketWorker.postMessage({ topic: 'create', data: { url, version, opts }});
}

function createAwait(url, version, handlers) {
  destroy();
  socketHandlers = {
    events: assign({}, defaultHandlers, handlers)
  };
  const opts = {
    options: {
      name: 'await',
      debug: false,
      pingDelay: 2000,
      sendOnOpen: 'following_onlines'
    }
  };
  socketWorker.postMessage({ topic: 'create', data: { url, version, opts}});
}

function createLobby(lobbyVersion, onOpen, handlers) {
  destroy();
  socketHandlers = {
    onOpen,
    events: assign({}, defaultHandlers, handlers)
  };
  const opts = {
    options: {
      name: 'lobby',
      debug: false,
      pingDelay: 2000,
      sendOnOpen: 'following_onlines'
    }
  };
  socketWorker.postMessage({ topic: 'create', data: {
    url: '/lobby/socket/v1',
    version: lobbyVersion,
    opts
  }});
}

function createDefault() {
  // default socket is useless when anon.
  if (utils.hasNetwork() && session.isConnected()) {
    destroy();
    socketHandlers = {
      events: defaultHandlers
    };
    const opts = {
      options: {
        name: 'default',
        debug: false,
        pingDelay: 2000,
        sendOnOpen: 'following_onlines'
      }
    };
    socketWorker.postMessage({ topic: 'create', data: {
      url: '/socket',
      version: 0,
      opts
    }});
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

export default {
  createGame,
  createLobby,
  createAwait,
  createDefault,
  setVersion(version) {
    socketWorker.postMessage({ topic: 'setVersion', data: version });
  },
  getAverageLag(callback) {
    socketHandlers.getAverageLagCallback = callback;
    socketWorker.postMessage({ topic: 'getAverageLag' });
  },
  send(type, data, opts) {
    socketWorker.postMessage({ topic: 'send', data: [type, data, opts] });
  },
  connect() {
    socketWorker.postMessage({ topic: 'connect' });
  },
  disconnect() {
    socketWorker.postMessage({ topic: 'disconnect' });
  },
  isConnected() {
    return connectedWS;
  },
  destroy
};
