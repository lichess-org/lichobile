import { get, set, pick, mapValues, mapKeys, throttle } from 'lodash';
import redraw from './utils/redraw';
import { fetchJSON, fetchText } from './http';
import { hasNetwork, handleXhrError, serializeQueryParameters } from './utils';
import i18n from './i18n';
import settings from './settings';
import friendsApi from './lichess/friends';
import challengesApi from './lichess/challenges';

interface Profile {
  country?: string
  location?: string
  bio?: string
  firstName?: string
  lastName?: string
}

interface NowPlayingGame {
  gameId: string
  fullId: string
  isMyTurn: boolean
  lastMove: string
  variant: Variant
  speed: Speed
  perf: Perf
  color: Color
  fen: string
  rated: boolean
  opponent: LightPlayer
  secondsLeft: number
}

interface Session {
  id: string
  username: string
  title?: string
  online: boolean
  engine: boolean
  booster: boolean
  kid: boolean
  patron: boolean
  language?: string
  profile?: Profile
  perfs: any
  createdAt: number
  seenAt: number
  playTime: number
  nowPlaying: Array<NowPlayingGame>
  prefs: any
  nbChallenges: number
  nbFollowers: number
  nbFollowing: number
}

interface LobbyJson {
  lobby: {
    version: number
  }
}

let session: Session = null;

function isConnected() {
  return !!session;
}

function getSession() {
  return session;
}

function getUserId() {
  return session && session.id;
}

function nowPlaying() {
  let np = session && session.nowPlaying || [];
  return np.filter(e => {
    return settings.game.supportedVariants.indexOf(e.variant.key) !== -1;
  });
}

function isKidMode() {
  return session && session.kid;
}

function isShadowban() {
  return session && session.troll;
}

function myTurnGames() {
  return nowPlaying().filter(e => {
    return e.isMyTurn;
  });
}

function toggleKidMode() {
  return fetchText('/account/kidConfirm', {
    method: 'POST'
  });
}

function savePreferences() {

  function numValue(v: any) {
    if (v === true) return 1;
    else if (v === false) return 0;
    else return v;
  }

  const prefs = session && session.prefs || {};
  const display = mapKeys(mapValues(pick(prefs, [
    'animation',
    'captured',
    'highlight',
    'destination',
    'coords',
    'replay',
    'blindfold'
  ]), numValue), (_, k) => 'display.' + k);
  const behavior = mapKeys(mapValues(pick(prefs, [
    'premove',
    'takeback',
    'autoQueen',
    'autoThreefold',
    'submitMove',
    'confirmResign'
  ]), numValue), (_, k) => 'behavior.' + k);
  const rest = mapValues(pick(prefs, [
    'clockTenths',
    'clockBar',
    'clockSound',
    'follow',
    'challenge',
    'message',
    'insightShare'
  ]), numValue);

  return fetchText('/account/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept': 'application/json, text/*'
    },
    body: serializeQueryParameters(Object.assign(rest, display, behavior))
  }, true);
}

function lichessBackedProp(path: string, prefRequest: () => Promise<any>) {
  return function() {
    if (arguments.length) {
      let oldPref: any;
      if (session) {
        oldPref = get(session, path);
        set(session, path, arguments[0]);
      }
      prefRequest()
      .catch((err: any) => {
        if (session) set(session, path, oldPref);
        handleXhrError(err);
      });
    }

    return session && get(session, path);
  };
}

function isSession(data: Session | LobbyJson): data is Session {
  return (<Session>data).id !== undefined;
}

function login(username: string, password: string) {
  return fetchJSON('/login', {
    method: 'POST',
    body: JSON.stringify({
      username,
      password
    })
  }, true)
  .then((data: Session | LobbyJson) => {
    if (isSession(data)) {
      session = <Session>data;
      return session;
    } else {
      throw { ipban: true };
    }
  });
}

function logout() {
  return fetchJSON('/logout', null, true)
  .then(function() {
    session = null;
    friendsApi.clear();
    redraw();
  });
}

function signup(username: string, email: string, password: string) {
  return fetchJSON('/signup', {
    method: 'POST',
    body: JSON.stringify({
      username,
      email,
      password
    })
  }, true)
  .then(function(data) {
    session = data;
    return session;
  });
}

function rememberLogin() {
  return fetchJSON('/account/info')
  .then(data => {
    session = data;
    return data;
  });
}

function refresh(): Promise<Session> {
  if (hasNetwork() && isConnected()) {
    return fetchJSON('/account/info')
    .then(data => {
      session = data;
      // if server tells me, reload challenges
      if (session.nbChallenges !== challengesApi.incoming().length) {
        challengesApi.refresh().then(redraw);
      }
      redraw();
      return session;
    })
    .catch(err => {
      if (session && err.response && err.response.status === 401) {
        session = null;
        redraw();
        window.plugins.toast.show(i18n('signedOut'), 'short', 'center');
      }
      throw err;
    });
  } else {
    return Promise.resolve(undefined);
  }
}

export default {
  isConnected,
  isKidMode,
  isShadowban,
  logout,
  signup,
  login: throttle(login, 1000),
  rememberLogin: throttle(rememberLogin, 1000),
  refresh: throttle(refresh, 1000),
  savePreferences: throttle(savePreferences, 1000),
  get: getSession,
  getUserId,
  nowPlaying,
  myTurnGames,
  lichessBackedProp,
  toggleKidMode
};
