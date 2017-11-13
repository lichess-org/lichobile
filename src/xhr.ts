import globalConfig from './config'
import { fetchJSON, fetchText } from './http'
import { currentSri, noop } from './utils'
import storage from './storage'
import settings from './settings'
import i18n from './i18n'
import session from './session'
import { TimelineData, LobbyData, HookData, Pool, HumanSeekSetup, CorrespondenceSeek, ApiStatus } from './lichess/interfaces'
import { ChallengesData, Challenge } from './lichess/interfaces/challenge'
import { OnlineGameData } from './lichess/interfaces/game'

interface GameSetup {
  variant: string
  timeMode: string
  days: string
  time: string
  increment: string
  color: string
  mode?: string
  ratingRange?: string
  fen?: string
  level?: string
}

export function newAiGame(fen?: string): Promise<OnlineGameData> {
  const config = settings.gameSetup.ai
  const body: GameSetup = {
    variant: config.variant(),
    timeMode: config.timeMode(),
    days: config.days(),
    time: config.time(),
    increment: config.increment(),
    level: config.level(),
    color: config.color()
  }

  if (fen) body.fen = fen

  return fetchJSON('/setup/ai', {
    method: 'POST',
    body: JSON.stringify(body)
  }, true)
}

export function seekGame(setup: HumanSeekSetup): Promise<HookData> {
  const { ratingMin, ratingMax, ...rest } = setup
  let body: string
  if (ratingMin !== undefined && ratingMax !== undefined) {
    const ratingRange = ratingMin + '-' + ratingMax
    body = JSON.stringify({ ratingRange, ...rest })
  } else {
    body = JSON.stringify({ ...rest })
  }
  return fetchJSON('/setup/hook/' + currentSri(), {
    method: 'POST',
    body
  }, true)
}

export function challenge(userId: string, fen?: string): Promise<{ challenge: Challenge }> {
  const config = settings.gameSetup.challenge
  const url = userId ? `/setup/friend?user=${userId}` : '/setup/friend'

  const body: GameSetup = {
    variant: config.variant(),
    timeMode: config.timeMode(),
    days: config.days(),
    time: config.time(),
    increment: config.increment(),
    color: config.color(),
    mode: session.isConnected() ? config.mode() : '0'
  }

  if (fen) body.fen = fen

  return fetchJSON(url, {
    method: 'POST',
    body: JSON.stringify(body)
  }, true)
}

export function getChallenges(): Promise<ChallengesData> {
  return fetchJSON('/challenge')
}

interface ChallengeData {
  challenge: Challenge
  socketVersion: number
}
export function getChallenge(id: string): Promise<ChallengeData> {
  return fetchJSON(`/challenge/${id}`, {}, true)
}

export function cancelChallenge(id: string): Promise<string> {
  return fetchText(`/challenge/${id}/cancel`, {
    method: 'POST'
  }, true)
}

export function declineChallenge(id: string): Promise<string> {
  return fetchText(`/challenge/${id}/decline`, {
    method: 'POST'
  }, true)
}

export function acceptChallenge(id: string): Promise<OnlineGameData> {
  return fetchJSON(`/challenge/${id}/accept`, { method: 'POST'}, true)
}

export let cachedPools: Array<Pool> = []
export function lobby(feedback?: boolean): Promise<LobbyData> {
  return fetchJSON('/', undefined, feedback)
  .then((d: LobbyData) => {
    if (d.lobby.pools !== undefined) cachedPools = d.lobby.pools
    return d
  })
}

export function seeks(feedback: boolean): Promise<CorrespondenceSeek[]> {
  return fetchJSON('/lobby/seeks', undefined, feedback)
}

export function game(id: string, color?: string): Promise<OnlineGameData> {
  let url = '/' + id
  if (color) url += ('/' + color)
  return fetchJSON(url)
}

export function toggleGameBookmark(id: string) {
  return fetchText('/bookmark/' + id, {
    method: 'POST'
  })
}

export function featured(channel: string, flip: boolean): Promise<OnlineGameData> {
  return fetchJSON('/tv/' + channel, flip ? { query: { flip: 1 }} : {})
}

export function importMasterGame(gameId: string, orientation: Color): Promise<OnlineGameData> {
  return fetchJSON(`/import/master/${gameId}/${orientation}`)
}

export function setServerLang(lang: string): Promise<void> {
  if (session.isConnected()) {
    return fetchJSON('/translation/select', {
      method: 'POST',
      body: JSON.stringify({
        lang
      })
    })
    .then(() => {})
  } else {
    return Promise.resolve()
  }
}

export function miniUser(userId: string) {
  return fetchJSON(`/@/${userId}/mini`)
}

export function timeline(): Promise<TimelineData> {
  return fetchJSON('/timeline', undefined, false)
}

export function status() {
  return fetchJSON('/api/status', {
    query: {
      v: window.AppVersion ? window.AppVersion.version : null
    }
  })
  .then((data: ApiStatus) => {
    // warn if buggy app
    if (data.mustUpgrade) {
      const v = window.AppVersion ? window.AppVersion.version : 'dev'
      const key = 'warn_bug_' + v
      const warnCount = Number(storage.get(key)) || 0
      if (warnCount === 0) {
        window.navigator.notification.alert(
          'A new version of lichess mobile is available. Please upgrade as soon as possible.',
          () => {
            storage.set(key, 1)
          }
        )
      }
      else if (warnCount === 10) {
        storage.remove(key)
      }
      else {
        storage.set(key, warnCount + 1)
      }
    }
    else if (data.api.current > globalConfig.apiVersion) {
      const versionInfo = data.api.olds.find(o => o.version === globalConfig.apiVersion)
      if (versionInfo) {
        const now = new Date(),
        unsupportedDate = new Date(versionInfo.unsupportedAt),
        deprecatedDate = new Date(versionInfo.deprecatedAt)

        const key = 'warn_old_' + versionInfo.version
        const deprWarnCount = Number(storage.get(key)) || 0

        if (now > unsupportedDate) {
          window.navigator.notification.alert(
            i18n('apiUnsupported'),
            noop
          )
        }
        else if (now > deprecatedDate) {
          if (deprWarnCount === 0) {
            window.navigator.notification.alert(
              i18n('apiDeprecated', window.moment(unsupportedDate).format('LL')),
              () => {
                storage.set(key, 1)
              }
            )
          }
          else if (deprWarnCount === 15) {
            storage.remove(key)
          }
          else {
            storage.set(key, deprWarnCount + 1)
          }
        }
      }
    }
  })
}

export function createToken() {
  return fetchJSON('/auth/token', {method: 'POST'}, true)
}

export function openWebsitePatronPage() {
  createToken().then((data: {url: string, userId: string}) => {
    window.open(data.url + '?referrer=/patron', '_blank', 'location=no')
  })
}
