import router from './router';
import redraw from './utils/redraw';
import { apiVersion } from './http';
import { xorWith, isEqual, cloneDeep } from 'lodash';
import { lichessSri, autoredraw, hasNetwork } from './utils';
import { tellWorker, askWorker } from './utils/worker';
import * as xhr from './xhr';
import i18n from './i18n';
import friendsApi from './lichess/friends';
import challengesApi from './lichess/challenges';
import session from './session';

const worker = new Worker('lib/socketWorker.js');

interface LichessMessage {
  t: string;
  d?: any;
}

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

type MessageHandler = (d: any, payload?: LichessMessage) => void;
interface MessageHandlers {
  [index: string]: MessageHandler
}

interface SocketHandlers {
  onOpen: () => void;
  onError?: () => void;
  events: MessageHandlers
}

interface SocketSetup {
  clientId: string
  socketEndPoint: string
  url: string
  version: number
  opts: SocketConfig
}

let connectedWS = true;
let redrawOnDisconnectedTimeoutID: number;

let currentMoveLatency: number = 0;

const defaultHandlers: MessageHandlers = {
  following_onlines: handleFollowingOnline,
  following_enters: (name: string, payload: any) =>
    autoredraw(() => friendsApi.add(name, payload.playing || false)),
  following_leaves: (name: string) => autoredraw(() => friendsApi.remove(name)),
  following_playing: name => autoredraw(() => friendsApi.playing(name)),
  following_stopped_playing: name =>
    autoredraw(() => friendsApi.stoppedPlaying(name)),
  challenges: (data: any) => {
    challengesApi.set(data);
    redraw();
  },
  mlat: (mlat: number) => {
    currentMoveLatency = mlat;
  }
};

function handleFollowingOnline(data: Array<string>, payload: any) {
  // We clone the friends online before we update it for comparison later
  const oldFriendList = cloneDeep(friendsApi.list());

  const friendsPlaying = payload.playing;
  friendsApi.set(data, friendsPlaying);

  const newFriendList = friendsApi.list()

  if (xorWith(oldFriendList, newFriendList, isEqual).length > 0) {
    redraw();
  }
}

function setupConnection(setup: SocketSetup, socketHandlers: SocketHandlers) {
  worker.onmessage = (msg: MessageEvent) => {
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
  };
  tellWorker(worker, 'create', setup);
}

function createGame(url: string, version: number, handlers: Object, gameUrl: string, userTv?: string) {
  let errorDetected = false;
  const socketHandlers = {
    onError: function() {
      // we can't get socket error, so we send an xhr to test whether the
      // rejection is an authorization issue
      if (!errorDetected) {
        // just to be sure that we don't send an xhr every second when the
        // websocket is trying to reconnect
        errorDetected = true;
        xhr.game(gameUrl.substring(1))
        .catch(err => {
          if (err.response && err.response.status === 401) {
            window.plugins.toast.show(i18n('unauthorizedError'), 'short', 'center');
            router.set('/');
          }
        });
      }
    },
    onOpen: session.refresh,
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
  const setup = {
    clientId: lichessSri,
    socketEndPoint: window.lichess.socketEndPoint,
    url,
    version,
    opts
  }
  setupConnection(setup, socketHandlers)
}

function createTournament(tournamentId: string, version: number, handlers: Object, featuredGameId: string) {
  let url = '/tournament/' + tournamentId + `/socket/v${apiVersion}`;
  const socketHandlers = {
    events: Object.assign({}, defaultHandlers, handlers),
    onOpen: session.refresh
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
  const setup = {
    clientId: lichessSri,
    socketEndPoint: window.lichess.socketEndPoint,
    url,
    version,
    opts
  };
  setupConnection(setup, socketHandlers);
}

function createChallenge(id: string, version: number, onOpen: () => void, handlers: Object) {
  const socketHandlers = {
    onOpen: () => {
      session.refresh();
      onOpen();
    },
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
  const setup = {
    clientId: lichessSri,
    socketEndPoint: window.lichess.socketEndPoint,
    url,
    version,
    opts
  };
  setupConnection(setup, socketHandlers);
}

function createLobby(lobbyVersion: number, onOpen: () => void, handlers: Object) {
  const socketHandlers = {
    onOpen: () => {
      session.refresh();
      onOpen();
    },
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
  const setup = {
    clientId: lichessSri,
    socketEndPoint: window.lichess.socketEndPoint,
    url: `/lobby/socket/v${apiVersion}`,
    version: lobbyVersion,
    opts
  };
  setupConnection(setup, socketHandlers);
}

function createDefault() {
  if (hasNetwork()) {
    const socketHandlers = {
      events: defaultHandlers,
      onOpen: session.refresh
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
    const setup = {
      clientId: lichessSri,
      socketEndPoint: window.lichess.socketEndPoint,
      url: '/socket',
      version: 0,
      opts
    };
    setupConnection(setup, socketHandlers);
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
  clearTimeout(redrawOnDisconnectedTimeoutID);
  if (wasOff) redraw();
}

function onDisconnected() {
  const wasOn = connectedWS;
  connectedWS = false;
  if (wasOn) redrawOnDisconnectedTimeoutID = setTimeout(redraw, 2000);
}

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
  send(t: string, data?: any, opts?: any) {
    tellWorker(worker, 'send', [t, data, opts]);
  },
  connect() {
    tellWorker(worker, 'connect');
  },
  restorePrevious() {
    tellWorker(worker, 'restorePrevious');
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
  getCurrentPing(): Promise<number> {
    return askWorker(worker, { topic: 'currentLag' });
  },
  getCurrentMoveLatency() {
    return currentMoveLatency;
  },
  terminate() {
    if (worker) worker.terminate();
  }
};
