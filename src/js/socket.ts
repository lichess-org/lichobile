import router from './router';
import redraw from './utils/redraw';
import { apiVersion } from './http';
import { xorWith, isEqual, cloneDeep } from 'lodash';
import { lichessSri, autoredraw, hasNetwork } from './utils';
import { tellWorker, askWorker } from './utils/worker';
import * as xhr from './xhr';
import i18n from './i18n';
import friendsApi, { Friend } from './lichess/friends';
import challengesApi from './lichess/challenges';
import { ChallengesData } from './lichess/interfaces/challenge';
import session from './session';

interface LichessMessage<T> {
  t: string
  d?: T
}

type LichessMessageAny = LichessMessage<{}>

interface Options {
  name: string;
  debug?: boolean;
  pingDelay?: number;
  sendOnOpen?: Array<LichessMessageAny>;
  registeredEvents: string[];
}

interface SocketConfig {
  options: Options;
  params?: StringMap
}

type MessageHandler<D, P extends LichessMessage<D>> = (data: D, payload?: P) => void;
type MessageHandlerGeneric = MessageHandler<{}, undefined>
interface MessageHandlers {
  [index: string]: MessageHandlerGeneric
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
  version?: number
  opts: SocketConfig
}

interface ConnectionSetup {
  setup: SocketSetup
  handlers: SocketHandlers
}

interface FollowingEntersPayload extends LichessMessage<Friend> {
  playing: boolean
  patron: boolean
}

interface FollowingOnlinePayload extends LichessMessage<Array<string>> {
  playing: Array<string>
  patrons: Array<string>
}

// connectedWS means connection is established and server ping/pong
// is working normally
let connectedWS = false;
let currentMoveLatency: number = 0;
let rememberedSetups: Array<ConnectionSetup> = [];

const worker = new Worker('lib/socketWorker.js');
const defaultHandlers: MessageHandlers = {
  following_onlines: handleFollowingOnline,
  following_enters: (name: string, payload: FollowingEntersPayload) =>
    autoredraw(() => friendsApi.add(name, payload.playing || false, payload.patron || false)),
  following_leaves: (name: string) => autoredraw(() => friendsApi.remove(name)),
  following_playing: (name: string) => autoredraw(() => friendsApi.playing(name)),
  following_stopped_playing: (name: string) =>
    autoredraw(() => friendsApi.stoppedPlaying(name)),
  challenges: (data: ChallengesData) => {
    challengesApi.set(data);
    redraw();
  },
  mlat: (mlat: number) => {
    currentMoveLatency = mlat;
  }
};

function handleFollowingOnline(data: Array<string>, payload: FollowingOnlinePayload) {
  // We clone the friends online before we update it for comparison later
  const oldFriendList = cloneDeep(friendsApi.list());

  const friendsPlaying = payload.playing;
  const friendsPatrons = payload.patrons;
  friendsApi.set(data, friendsPlaying, friendsPatrons);

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
        if (h) h(msg.data.payload.d, msg.data.payload);
        break;
    }
  };
  // remember last 2 connection setup, to be able to restore the previous one
  rememberedSetups.push({ setup, handlers: socketHandlers })
  if (rememberedSetups.length > 2) rememberedSetups.shift()
  tellWorker(worker, 'create', setup);
}

function createGame(
  url: string,
  version: number,
  handlers: MessageHandlers,
  gameUrl: string,
  userTv?: string
) {
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

function createTournament(
  tournamentId: string,
  version: number,
  handlers: MessageHandlers,
  featuredGameId: string
) {
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

function createChallenge(
  id: string,
  version: number,
  onOpen: () => void,
  handlers: MessageHandlers
) {
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

function createLobby(
  onOpen: () => void,
  handlers: MessageHandlers
) {
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
        pingDelay: 3000,
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

export interface RedirectObj {
  url: string
  cookie?: {
    name: string
    value: string
    maxAge: string
  }
}
function redirectToGame(obj: string | RedirectObj) {
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
  if (!connectedWS) {
    connectedWS = true;
    redraw();
  }
}

function onDisconnected() {
  if (connectedWS) {
    connectedWS = false;
    redraw();
  }
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
  send<D, O>(t: string, data?: D, opts?: O) {
    tellWorker(worker, 'send', [t, data, opts]);
  },
  ask<D, O>(t: string, listenTo: string, data?: D, opts?: O) {
    return new Promise((resolve, reject) => {
      let tid: number
      function listen(e: MessageEvent) {
        if (e.data.topic === 'handle' && e.data.payload.t === listenTo) {
          clearTimeout(tid)
          worker.removeEventListener('message', listen);
          resolve(e.data.payload.d);
        }
      }
      worker.addEventListener('message', listen);
      tellWorker(worker, 'ask', { msg: [t, data, opts], listenTo });
      tid = setTimeout(() => {
        worker.removeEventListener('message', listen)
        reject()
      }, 3000)
    });
  },
  connect() {
    tellWorker(worker, 'connect');
  },
  restorePrevious() {
    // if by chance we don't have a previous connection, just close
    if (rememberedSetups.length === 2) {
      const { setup, handlers } = rememberedSetups.shift();
      rememberedSetups = [];
      setupConnection(setup, handlers)
    } else {
      tellWorker(worker, 'destroy');
    }
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
