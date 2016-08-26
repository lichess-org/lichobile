import router from './router';
import redraw from './utils/redraw';
import storage from './storage';
import { apiVersion } from './http';
import { xor } from 'lodash';
import { lichessSri, autoredraw, tellWorker, hasNetwork } from './utils';
import * as xhr from './xhr';
import i18n from './i18n';
import friendsApi from './lichess/friends';
import challengesApi from './lichess/challenges';
import session from './session';

const worker = new Worker('lib/socketWorker.js');

interface Options {
  name: string;
  debug?: boolean;
  pingDelay?: number;
  sendOnOpen?: Array<LichessMessage>;
  registeredEvents: string[];
}

interface SocketConfig {
  options: Options;
  params?: Object;
}

interface SocketHandlers {
  onOpen?: () => void;
  onError?: () => void;
  events: {[index: string]: (...args: any[]) => void};
}

let socketHandlers: SocketHandlers;
let errorDetected = false;
let connectedWS = true;

let alreadyWarned = false;
let redrawOnDisconnectedTimeoutID: number;
let proxyFailTimeoutID: number;

const proxyFailMsg = 'The connection to lichess server has failed. If the problem is persistent this may be caused by proxy or network issues. In that case, we\'re sorry: lichess online features such as games, connected friends or challenges won\'t work.';

const defaultHandlers: {[index: string]: (...args: any[]) => void} = {
  following_onlines: handleFollowingOnline,
  following_enters: (name: string) => autoredraw(() => friendsApi.add(name)),
  following_leaves: (name: string) => autoredraw(() => friendsApi.remove(name)),
  challenges: (data: any) => {
    challengesApi.set(data);
    redraw();
  }
};

function handleFollowingOnline(data: Array<string>) {
  const curList = friendsApi.list();
  friendsApi.set(data);
  if (xor(curList, data).length > 0) {
    redraw();
  }
}

function createGame(url: string, version: number, handlers: Object, gameUrl: string, userTv: string) {
  errorDetected = false;
  socketHandlers = {
    onError: function() {
      // we can't get socket error, so we send an xhr to test whether the
      // rejection is an authorization issue
      if (!errorDetected) {
        // just to be sure that we don't send an xhr every second when the
        // websocket is trying to reconnect
        errorDetected = true;
        xhr.game(gameUrl.substring(1))
        .catch(err => {
          if (err.status === 401) {
            window.plugins.toast.show(i18n('unauthorizedError'), 'short', 'center');
            router.set('/');
          }
        });
      }
    },
    events: Object.assign({}, defaultHandlers, handlers)
  };
  const opts: SocketConfig = {
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

function createTournament(tournamentId: string, version: number, handlers: Object, featuredGameId: string) {
  let url = '/tournament/' + tournamentId + `/socket/v${apiVersion}`;
  socketHandlers = {
    events: Object.assign({}, defaultHandlers, handlers)
  };
  const opts = {
    options: {
      name: 'tournament',
      debug: false,
      pingDelay: 2000,
      sendOnOpen: [{t: 'following_onlines'}, {t: 'startWatching', d: featuredGameId}],
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

function createChallenge(id: string, version: number, onOpen: () => void, handlers: Object) {
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

function createLobby(lobbyVersion: number, onOpen: () => void, handlers: Object) {
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

function redirectToGame(obj: any) {
  let url: string;
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
    router.set('/game' + url);
  }
}

function onConnected() {
  const wasOff = !connectedWS;
  connectedWS = true;
  clearTimeout(proxyFailTimeoutID);
  clearTimeout(redrawOnDisconnectedTimeoutID);
  if (wasOff) redraw();
}

function onDisconnected() {
  const wasOn = connectedWS;
  connectedWS = false;
  if (wasOn) redrawOnDisconnectedTimeoutID = setTimeout(function() {
    redraw();
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
      let h = socketHandlers.events[msg.data.payload.t];
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
  setVersion(version: number) {
    tellWorker(worker, 'setVersion', version);
  },
  send(type: string, data: any, opts: any) {
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
