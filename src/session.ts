import * as get from 'lodash/get'
import * as set from 'lodash/set'
import * as pick from 'lodash/pick'
import * as mapValues from 'lodash/mapValues'
import * as mapKeys from 'lodash/mapKeys'
import * as throttle from 'lodash/throttle'
import redraw from './utils/redraw'
import signals from './signals'
import { SESSION_ID_KEY, fetchJSON, fetchText, ErrorResponse } from './http'
import { hasNetwork, handleXhrError, serializeQueryParameters } from './utils'
import i18n from './i18n'
import push from './push'
import settings from './settings'
import { TempBan } from './lichess/interfaces'
import friendsApi from './lichess/friends'
import challengesApi from './lichess/challenges'
import storage, { StoredProp } from './storage'
import asyncStorage from './asyncStorage'

import { LobbyData, NowPlayingGame } from './lichess/interfaces'

type PrefValue = number | string | boolean
interface Prefs {
  [key: string]: PrefValue
}

export type EmailConfirm = { email_confirm: boolean }
export type SignupData = Session | EmailConfirm

interface Profile {
  readonly country?: string
  readonly location?: string
  readonly bio?: string
  readonly firstName?: string
  readonly lastName?: string
  readonly fideRating?: number
  readonly links?: string
}

export interface Session {
  readonly id: string
  readonly username: string
  readonly title?: string
  readonly online: boolean
  readonly engine: boolean
  readonly booster: boolean
  readonly troll?: boolean
  readonly kid: boolean
  readonly patron: boolean
  readonly language?: string
  readonly profile?: Profile
  readonly perfs: any
  readonly createdAt: number
  readonly seenAt: number
  readonly playTime: number
  readonly nowPlaying: ReadonlyArray<NowPlayingGame>
  readonly prefs: Prefs
  readonly nbChallenges: number
  readonly nbFollowers: number
  readonly nbFollowing: number
  readonly playban?: TempBan
  // sent on login/signup only
  readonly sessionId?: string
}

let session: Session | undefined

function isConnected(): boolean {
  return session !== undefined
}

function getSession(): Session | undefined {
  return session
}

// store session data for offline usage
function storeSession(d: Session): void {
  asyncStorage.setItem('session', d)
}

// clear session data stored in async storage and sessionId
function onLogout(): void {
  asyncStorage.removeItem('session')
  storage.remove(SESSION_ID_KEY)
  signals.afterLogout.dispatch()
}

function restoreStoredSession(): void {
  asyncStorage.getItem<Session>('session')
  .then(d => {
    session = d || undefined
    if (d !== null) {
      signals.sessionRestored.dispatch()
      redraw()
    }
  })
}

function getUserId(): string | undefined {
  return session && session.id
}

function nowPlaying(): NowPlayingGame[] {
  let np = session && session.nowPlaying || []
  return np.filter(e =>
    settings.game.supportedVariants.indexOf(e.variant.key) !== -1
  )
}

function currentBan(): Date | undefined {
  const playban = session && session.playban
  return playban && new Date(playban.date + playban.mins * 60000)
}

function isKidMode(): boolean {
  return !!(session && session.kid)
}

function isShadowban(): boolean {
  return !!(session && session.troll)
}

function myTurnGames() {
  return nowPlaying().filter(e => e.isMyTurn)
}

function showSavedPrefToast(data: string): string {
  window.plugins.toast.show('✓ Your preferences have been saved on lichess server.', 'short', 'center')
  return data
}

function setKidMode(): Promise<string> {
  return fetchText('/account/kid?v=' + isKidMode(), {
    method: 'POST'
  })
  .then(showSavedPrefToast)
}

function savePreferences(): Promise<string> {

  function numValue(v: boolean | number): string {
    if (v === true) return '1'
    else if (v === false) return '0'
    else return String(v)
  }

  const prefs = session && session.prefs || {}
  const display = mapKeys(<Prefs>mapValues(pick(prefs, [
    'animation',
    'captured',
    'highlight',
    'destination',
    'coords',
    'replay',
    'blindfold'
  ]), numValue), (_, k) => 'display.' + k) as StringMap
  const behavior = mapKeys(<Prefs>mapValues(pick(prefs, [
    'premove',
    'takeback',
    'autoQueen',
    'autoThreefold',
    'submitMove',
    'confirmResign'
  ]), numValue), (_, k) => 'behavior.' + k) as StringMap
  const rest = mapValues(pick(prefs, [
    'clockTenths',
    'clockBar',
    'clockSound',
    'follow',
    'challenge',
    'message',
    'insightShare'
  ]), numValue) as StringMap

  return fetchText('/account/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept': 'application/json, text/*'
    },
    body: serializeQueryParameters(Object.assign(rest, display, behavior))
  }, true)
  .then(showSavedPrefToast)
}

function lichessBackedProp<T extends string | number | boolean>(path: string, prefRequest: () => Promise<string>, defaultVal: T): StoredProp<T> {
  return function() {
    if (arguments.length) {
      let oldPref: T
      if (session) {
        oldPref = <T>get(session, path)
        set(session, path, arguments[0])
      }
      prefRequest()
      .catch((err) => {
        if (session) set(session, path, oldPref)
        handleXhrError(err)
      })
    }

    return session ? <T>get(session, path) : defaultVal
  }
}

function isSession(data: Session | LobbyData | SignupData): data is Session {
  return (<Session>data).id !== undefined
}

function login(username: string, password: string, token: string | null): Promise<Session | LobbyData> {
  return fetchJSON('/login', {
    method: 'POST',
    body: JSON.stringify({
      username,
      password,
      token,
    })
  }, true)
  .then((data: Session | LobbyData) => {
    if (isSession(data)) {
      session = <Session>data
      if (session.sessionId) {
        storage.set(SESSION_ID_KEY, session.sessionId)
      }
      storeSession(data)
      return session
    } else {
      throw { ipban: true }
    }
  })
}

function logout() {
  return push.unregister()
  .then(() =>
    fetchJSON('/logout', { method: 'POST' }, true)
    .then(() => {
      session = undefined
      onLogout()
      friendsApi.clear()
      redraw()
    })
  )
  .catch(handleXhrError)
}

function confirmEmail(token: string): Promise<Session> {
  return fetchJSON(`/signup/confirm/${token}`, undefined, true)
  .then((data: Session) => {
    session = data
    storeSession(data)
    return session
  })
}

function signup(
  username: string,
  email: string,
  password: string
): Promise<SignupData> {
  return fetchJSON<SignupData>('/signup', {
    method: 'POST',
    body: JSON.stringify({
      username,
      email,
      password,
      'can-confirm': true
    })
  }, true)
  .then(d => {
    if (isSession(d)) {
      session = d
      if (session.sessionId) {
        storage.set(SESSION_ID_KEY, session.sessionId)
      }
    }

    return d
  })
}

function rememberLogin(): Promise<Session> {
  return fetchJSON('/account/info')
  .then((data: Session) => {
    session = data
    storeSession(data)
    return data
  })
}

function refresh(): Promise<void> {
  return fetchJSON<Session>('/account/info', { cache: 'reload' })
  .then((data: Session) => {
    session = data
    storeSession(data)
    // if server tells me, reload challenges
    if (session.nbChallenges !== challengesApi.incoming().length) {
      challengesApi.refresh().then(redraw)
    }
    redraw()
  })
  .catch((err: ErrorResponse) => {
    if (session !== undefined && err.status === 401) {
      session = undefined
      onLogout()
      redraw()
      window.plugins.toast.show(i18n('signedOut'), 'short', 'center')
    }
  })
}

function backgroundRefresh(): void {
  if (hasNetwork() && isConnected()) {
    fetchJSON<Session>('/account/info')
    .then((data: Session) => {
      session = data
      storeSession(data)
      // if server tells me, reload challenges
      if (session.nbChallenges !== challengesApi.incoming().length) {
        challengesApi.refresh().then(redraw)
      }
    })
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
  restoreStoredSession,
  refresh: throttle(refresh, 1000),
  backgroundRefresh: throttle(backgroundRefresh, 1000),
  savePreferences: throttle(savePreferences, 1000),
  get: getSession,
  getUserId,
  appUser(fallback: string) {
    if (session)
      return session && session.username
    else
      return fallback
  },
  nowPlaying,
  myTurnGames,
  lichessBackedProp,
  setKidMode,
  confirmEmail,
  currentBan,
  hasCurrentBan(): boolean {
    return currentBan() !== undefined
  },
}
