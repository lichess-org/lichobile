import { Dialog } from '@capacitor/dialog'
import globalConfig from './config'
import { fetchJSON, fetchText } from './http'
import { currentSri } from './utils'
import storage from './storage'
import settings from './settings'
import i18n, { formatDate } from './i18n'
import session from './session'
import { TimelineData, LobbyData, HookData, Pool, HumanSeekSetup, CorrespondenceSeek, ApiStatus } from './lichess/interfaces'
import { ChallengeData, ChallengesData, Challenge } from './lichess/interfaces/challenge'
import { OnlineGameData } from './lichess/interfaces/game'
import { MiniUser } from './lichess/interfaces/user'
import { makeRatingRange } from './lichess/setup'

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

export function newAiGame(fen?: string | false): Promise<OnlineGameData> {
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
  const { ratingRangeMin, ratingRangeMax, ...rest } = setup
  const user = session.get()
  const ratingRange = user ? makeRatingRange(user, setup) : null
  const body = ratingRange ? {
    ...rest,
    ratingRange,
  } : { ...rest }

  return fetchJSON('/setup/hook/' + currentSri(), {
    method: 'POST',
    body: JSON.stringify(body),
  }, true)
}

export function newOpponentHook(gameId: string, setup: HumanSeekSetup): Promise<HookData> {
  const user = session.get()
  const rr = user ? makeRatingRange(user, setup) : null
  return fetchJSON(`/setup/hook/${currentSri()}/like/${gameId}?rr=${rr || ''}`, {
    method: 'POST',
  }, true)
}

export function challenge(userId?: string, fen?: string | false): Promise<{ challenge: Challenge }> {
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

export let cachedPools: ReadonlyArray<Pool> = []
export function lobby(feedback?: boolean): Promise<LobbyData> {
  return fetchJSON<LobbyData>('/', undefined, feedback)
  .then((d: LobbyData) => {
    if (d.lobby.pools !== undefined) cachedPools = d.lobby.pools
    return d
  })
}

export function seeks(feedback: boolean): Promise<CorrespondenceSeek[]> {
  return fetchJSON('/lobby/seeks', {
    query: {
      _: Date.now()
    }
  }, feedback)
}

export function game(id: string, color?: string): Promise<OnlineGameData | ChallengeData> {
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
    .then(() => { /* noop */ })
  } else {
    return Promise.resolve()
  }
}

export function miniUser(userId: string): Promise<MiniUser> {
  return fetchJSON(`/@/${userId}/mini`)
}

export function timeline(): Promise<TimelineData> {
  return fetchJSON('/timeline', {query: {nb: 10}}, false)
}

export function status(): Promise<void> {
  const v = window.deviceInfo.appVersion || 'web-dev'
  return fetchJSON<ApiStatus>('/api/status', {
    query: {
      v
    }
  })
  .then((data: ApiStatus) => {
    // warn if buggy app
    if (data.mustUpgrade) {
      const key = 'warn_bug_' + v
      const warnCount = Number(storage.get(key)) || 0
      if (warnCount === 0) {
        Dialog.alert({
          title: 'Alert',
          message: 'A new version of lichess mobile is available. Please upgrade as soon as possible.',
        }).then(() => {
          storage.set(key, 1)
        })
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
          Dialog.alert({
            title: 'Alert',
            message: i18n('apiUnsupported'),
          })
        }
        else if (now > deprecatedDate) {
          if (deprWarnCount === 0) {
            Dialog.alert({
              title: 'Alert',
              message: i18n('apiDeprecated', formatDate(unsupportedDate)),
            }).then(() => {
              storage.set(key, 1)
            })
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
