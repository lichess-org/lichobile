import { Toast } from '@capacitor/toast'
import { Device } from '@capacitor/device'
import throttle from 'lodash-es/throttle'
import redraw from './utils/redraw'
import signals from './signals'
import { SESSION_ID_KEY, fetchJSON, fetchText } from './http'
import { hasNetwork, handleXhrError, serializeQueryParameters } from './utils'
import { getAtPath, setAtPath, pick } from './utils/object'
import i18n from './i18n'
import push from './push'
import settings, { Prop } from './settings'
import { TempBan, LobbyData, NowPlayingGame } from './lichess/interfaces'
import { PlayTime, Perfs } from './lichess/interfaces/user'
import friendsApi from './lichess/friends'
import { PrefValue } from './lichess/prefs'
import challengesApi from './lichess/challenges'
import storage from './storage'
import asyncStorage from './asyncStorage'
import announce, { Announcement } from './announce'

interface Prefs {
  [key: string]: PrefValue
}

export type EmailConfirm = { email_confirm: boolean }
export type SignupData = Session | EmailConfirm

export interface Profile {
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
  readonly tosViolation?: boolean
  readonly troll?: boolean
  readonly kid: boolean
  readonly patron: boolean
  readonly language?: string
  readonly profile?: Profile
  readonly perfs: Perfs
  readonly createdAt: number
  readonly seenAt: number
  readonly playTime: PlayTime
  readonly nowPlaying: ReadonlyArray<NowPlayingGame>
  readonly prefs: Prefs
  readonly nbChallenges: number
  readonly nbFollowers: number
  readonly playban?: TempBan
  // sent on login/signup only
  readonly sessionId?: string
  readonly announce?: Announcement
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
  asyncStorage.set('session', d)
}

// clear session data stored in async storage and sessionId
function onLogout(): void {
  asyncStorage.remove('session')
  storage.remove(SESSION_ID_KEY)
  signals.afterLogout.dispatch()
}

function restoreStoredSession(): void {
  asyncStorage.get<Session>('session')
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

function nowPlaying(): readonly NowPlayingGame[] {
  const np = session && session.nowPlaying || []
  return np.filter(e =>
    settings.game.supportedVariants.indexOf(e.variant.key) !== -1
  )
}

function isKidMode(): boolean {
  return !!(session && session.kid)
}

function isShadowban(): boolean {
  return !!(session && session.troll)
}

function myTurnGames(): readonly NowPlayingGame[] {
  return nowPlaying().filter(e => e.isMyTurn)
}

function showSavedPrefToast(data: string): string {
  Toast.show({ text: '✓ lichess.org: ' + i18n('yourPreferencesHaveBeenSaved'), position: 'center', duration: 'short' })
  return data
}

function setKidMode(v: boolean, data: Record<string, string>): Promise<void> {
  return fetchText(`/account/kid?v=${v}`, {
    method: 'POST',
    body: new URLSearchParams(data),
    headers: {
      'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept': 'application/json, text/*'
    },
  }, true)
  .then(refresh)
}

function numValue(v: string | boolean | number): string {
  if (v === true) return '1'
  else if (v === false) return '0'
  else return String(v)
}

function makeReducer(prefix: string) {
  return function(acc: Partial<Prefs>, [k, v]: [string, PrefValue]) {
    return {
      ...acc,
      [prefix + k]: numValue(v)
    }
  }
}

const savePreferences = throttle((): Promise<string> => {

  const prefs = session && session.prefs || {}

  const display = Object.entries(pick(prefs, [
    'animation',
    'captured',
    'highlight',
    'destination',
    'coords',
    'replay',
    'blindfold'
  ])).reduce(makeReducer('display.'), {}) as Record<string, string>

  const behavior = Object.entries(pick(prefs, [
    'premove',
    'takeback',
    'autoQueen',
    'autoThreefold',
    'submitMove',
    'confirmResign',
    'moretime',
  ])).reduce(makeReducer('behavior.'), {}) as Record<string, string>

  const rest = Object.entries(pick(prefs, [
    'clockTenths',
    'clockBar',
    'clockSound',
    'follow',
    'challenge',
    'message',
    'insightShare'
  ])).reduce(makeReducer(''), {}) as Record<string, string>

  return fetchText('/account/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept': 'application/json, text/*'
    },
    body: serializeQueryParameters({ ...rest, ...display, ...behavior })
  }, true)
  .then(showSavedPrefToast)
}, 1000)

function lichessBackedProp<T extends PrefValue>(path: string, defaultVal: T): Prop<T> {
  return function(...args: unknown[]) {
    if (args.length) {
      let oldPref: T
      if (session) {
        oldPref = <T>getAtPath(session, path)
        setAtPath(session, path, args[0])
      }
      savePreferences()
      .catch((err) => {
        if (session) setAtPath(session, path, oldPref)
        if (hasNetwork()) handleXhrError(err)
      })
    }

    return session ? <T>getAtPath(session, path) : defaultVal
  }
}

function isSession(data: Session | LobbyData | SignupData): data is Session {
  return (<Session>data).id !== undefined
}

function login(username: string, password: string, token: string | null): Promise<Session> {
  return fetchJSON<Session | LobbyData>('/login', {
    method: 'POST',
    body: JSON.stringify({
      username,
      password,
      token,
    })
  }, true)
  .then(data => {
    if (isSession(data)) {
      session = data
      if (session.sessionId) {
        storage.set(SESSION_ID_KEY, session.sessionId)
      }
      storeSession(data)
      sendUUID()
      return session
    } else {
      throw { ipban: true }
    }
  })
}

function logout(): Promise<void> {
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
  return fetchJSON<Session>(`/signup/confirm/${token}`, undefined, true)
  .then(data => {
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
      sendUUID()
    }

    return d
  })
}

function rememberLogin(): Promise<Session> {
  return fetchJSON<Session>('/account/info')
  .then(data => {
    session = data
    storeSession(data)
    return data
  })
}

async function refresh(): Promise<void> {
  try {
    const data = await fetchJSON<Session>('/account/info', { cache: 'reload' })
    session = data
    storeSession(data)
    announce.set(data.announce)
    // if server tells me, reload challenges
    if (session.nbChallenges !== challengesApi.incoming().length) {
      challengesApi.refresh().then(redraw)
    }
    redraw()
  } catch (err) {
    if (session !== undefined && err.status === 401) {
      session = undefined
      onLogout()
      redraw()
      Toast.show({ text: 'You have been signed out', position: 'center', duration: 'short' })
    }
  }
}

async function backgroundRefresh(): Promise<void> {
  if (hasNetwork() && isConnected()) {
    const data = await fetchJSON<Session>('/account/info')
    session = data
    storeSession(data)
    announce.set(data.announce)
    // if server tells me, reload challenges
    if (session.nbChallenges !== challengesApi.incoming().length) {
      challengesApi.refresh().then(redraw)
    }
  }
}

function sendUUID(): void {
  Device.getId()
  .then(({ uuid }) => {
    if (uuid !== 'web') {
      fetchText(`/auth/set-fp/${uuid}/0`, { method: 'POST' })
    }
  })
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
  get: getSession,
  getUserId,
  appUser(fallback: string): string {
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
  hasCurrentBan(): boolean {
    return session?.playban !== undefined
  },
}
