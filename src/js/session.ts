import { get, set, pick, mapValues, mapKeys, throttle } from 'lodash';
import redraw from './utils/redraw';
import { fetchJSON, fetchText } from './http';
import { hasNetwork, handleXhrError, serializeQueryParameters } from './utils';
import i18n from './i18n';
import settings from './settings';
import friendsApi from './lichess/friends';
import challengesApi from './lichess/challenges';
import { SettingsProp } from './settings'

import { LobbyData, NowPlayingGame } from './lichess/interfaces';

interface Profile {
  country?: string
  location?: string
  bio?: string
  firstName?: string
  lastName?: string
}

export interface Session {
  id: string
  username: string
  title?: string
  online: boolean
  engine: boolean
  booster: boolean
  troll?: boolean
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

function lichessBackedProp<T>(path: string, prefRequest: () => Promise<string>): SettingsProp<T> {
  return function() {
    if (arguments.length) {
      let oldPref: T;
      if (session) {
        oldPref = <T>get(session, path);
        set(session, path, arguments[0]);
      }
      prefRequest()
      .catch((err) => {
        if (session) set(session, path, oldPref);
        handleXhrError(err);
      });
    }

    return session && <T>get(session, path)
  }
}

function isSession(data: Session | LobbyData): data is Session {
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
  .then((data: Session | LobbyData) => {
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

function signup(username: string, email: string, password: string): Promise<Session> {
  return fetchJSON('/signup', {
    method: 'POST',
    body: JSON.stringify({
      username,
      email,
      password
    })
  }, true)
  .then((data: Session) => {
    session = data;
    return session;
  });
}

function rememberLogin(): Promise<Session> {
  return fetchJSON('/account/info')
  .then((data: Session) => {
    session = data;
    return data;
  });
}

function refresh(): Promise<Session> {
  if (hasNetwork() && isConnected()) {
    return fetchJSON('/account/info')
    .then((data: Session) => {
      session = data;
      // if server tells me, reload challenges
      if (session.nbChallenges !== challengesApi.incoming().length) {
        challengesApi.refresh().then(() => redraw());
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
  appUser(fallback: string) {
    if (session)
      return session && session.username;
    else
      return fallback;
  },
  nowPlaying,
  myTurnGames,
  lichessBackedProp,
  toggleKidMode
};
