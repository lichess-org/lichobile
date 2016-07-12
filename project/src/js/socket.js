import storage from './storage';
import { apiVersion } from './http';
import xor from 'lodash/xor';
import { lichessSri, autoredraw, tellWorker, hasNetwork } from './utils';
import * as xhr from './xhr';
import i18n from './i18n';
import friendsApi from './lichess/friends';
import challengesApi from './lichess/challenges';
import session from './session';
import m from 'mithril';

const worker = new Worker('lib/socketWorker.js');

let socketHandlers;
let errorDetected = false;
let connectedWS = true;

let alreadyWarned = false;
let redrawOnDisconnectedTimeoutID;
let proxyFailTimeoutID;
const proxyFailMsg = 'The connection to lichess server has failed. If the problem is persistent this may be caused by proxy or network issues. In that case, we\'re sorry: lichess online features such as games, connected friends or challenges won\'t work.';

const defaultHandlers = {
  following_onlines: handleFollowingOnline,
  following_enters: name => autoredraw(() => friendsApi.add(name)),
  following_leaves: name => autoredraw(() => friendsApi.remove(name)),
  challenges: data => {
    challengesApi.set(data);
    m.redraw();
  }
};

function handleFollowingOnline(data) {
  const curList = friendsApi.list();
  friendsApi.set(data);
  if (xor(curList, data).length > 0) {
    m.redraw();
  }
}

function createGame(url, version, handlers, gameUrl, userTv) {
  errorDetected = false;
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
    events: Object.assign({}, defaultHandlers, handlers)
  };
  const opts = {
    options: {
      name: 'game',
      debug: false,
      sendOnOpen: [{t: 'following_onlines'}],
      registeredEvents: Object.keys(socketHandlers.events)
    }
  };
  if (userTv) opts.params = { userTv };
  tellWorker(worker, 'create', {
    clientId: lichessSri,
    socketEndPoint: window.lichess.socketEndPoint,
    url,
    version,
    opts
  });
}

function createTournament(tournamentId, version, handlers, featuredGame) {
  let url = '/tournament/' + tournamentId + `/socket/v${apiVersion}`;
  socketHandlers = {
    events: Object.assign({}, defaultHandlers, handlers)
  };
  const opts = {
    options: {
      name: 'tournament',
      debug: false,
      pingDelay: 2000,
      sendOnOpen: [{t: 'following_onlines'}, {t: 'startWatching', d: featuredGame}],
      registeredEvents: Object.keys(socketHandlers.events)
    }
  };
  tellWorker(worker, 'create', {
    clientId: lichessSri,
    socketEndPoint: window.lichess.socketEndPoint,
    url,
    version,
    opts
  });
}

function createChallenge(id, version, onOpen, handlers) {
  socketHandlers = {
    onOpen,
    events: Object.assign({}, defaultHandlers, handlers)
  };
  const url = `/challenge/${id}/socket/v${version}`;
  const opts = {
    options: {
      name: 'challenge',
      debug: false,
      ignoreUnknownMessages: true,
      pingDelay: 2000,
      sendOnOpen: [{t: 'following_onlines'}],
      registeredEvents: Object.keys(socketHandlers.events)
    }
  };
  tellWorker(worker, 'create', {
    clientId: lichessSri,
    socketEndPoint: window.lichess.socketEndPoint,
    url,
    version,
    opts
  });
}

function createLobby(lobbyVersion, onOpen, handlers) {
  socketHandlers = {
    onOpen,
    events: Object.assign({}, defaultHandlers, handlers)
  };
  const opts = {
    options: {
      name: 'lobby',
      debug: false,
      pingDelay: 2000,
      sendOnOpen: [{t: 'following_onlines'}],
      registeredEvents: Object.keys(socketHandlers.events)
    }
  };
  tellWorker(worker, 'create', {
    clientId: lichessSri,
    socketEndPoint: window.lichess.socketEndPoint,
    url: `/lobby/socket/v${apiVersion}`,
    version: lobbyVersion,
    opts
  });
}

function createDefault() {
  // default socket is useless when anon.
  if (hasNetwork() && session.isConnected()) {
    socketHandlers = {
      events: defaultHandlers
    };
    const opts = {
      options: {
        name: 'default',
        debug: false,
        pingDelay: 2000,
        sendOnOpen: [{t: 'following_onlines'}],
        registeredEvents: Object.keys(socketHandlers.events)
      }
    };
    tellWorker(worker, 'create', {
      clientId: lichessSri,
      socketEndPoint: window.lichess.socketEndPoint,
      url: '/socket',
      version: 0,
      opts
    });
  }
}

function redirectToGame(obj) {
  let url;
  if (typeof obj === 'string') url = obj;
  else {
    url = obj.url;
    if (obj.cookie) {
      const domain = document.domain.replace(/^.+(\.[^\.]+\.[^\.]+)$/, '$1');
      const cookie = [
        encodeURIComponent(obj.cookie.name) + '=' + obj.cookie.value,
        '; max-age=' + obj.cookie.maxAge,
        '; path=/',
        '; domain=' + domain
        ].join('');
        document.cookie = cookie;
    }
    m.route('/game' + url);
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
    if (hasNetwork() && !connectedWS) {
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

worker.addEventListener('message', function(msg) {
  switch (msg.data.topic) {
    case 'onOpen':
      if (socketHandlers.onOpen) socketHandlers.onOpen();
      break;
    case 'disconnected':
      onDisconnected();
      break;
    case 'connected':
      onConnected();
      break;
    case 'onError':
      if (socketHandlers.onError) socketHandlers.onError();
      break;
    case 'handle':
      var h = socketHandlers.events[msg.data.payload.t];
      if (h) h(msg.data.payload.d || null, msg.data.payload);
      break;
  }
});

export default {
  createGame,
  createChallenge,
  createLobby,
  createTournament,
  createDefault,
  redirectToGame,
  setVersion(version) {
    tellWorker(worker, 'setVersion', version);
  },
  send(type, data, opts) {
    tellWorker(worker, 'send', [type, data, opts]);
  },
  connect() {
    tellWorker(worker, 'connect');
  },
  disconnect() {
    tellWorker(worker, 'disconnect');
  },
  isConnected() {
    return connectedWS;
  },
  destroy() {
    tellWorker(worker, 'destroy');
  },
  terminate() {
    if (worker) worker.terminate();
  }
};
