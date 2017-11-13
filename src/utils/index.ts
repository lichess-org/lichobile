import i18n from '../i18n'
import globalConfig from '../config'
import { ErrorResponse } from '../http'
import redraw from './redraw'
import { GameData } from '../lichess/interfaces/game'
import { TournamentClock } from '../lichess/interfaces/tournament'

let sri: string

export function currentSri() {
  return sri || newSri()
}

export function newSri() {
  sri = Math.random().toString(36).substring(2).slice(0, 10)
  return sri
}

export function loadLocalJsonFile<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.overrideMimeType('application/json')
    xhr.open('GET', url, true)
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 0 || xhr.status === 200)
          resolve(JSON.parse(xhr.responseText))
        else
          reject(xhr)
      }
    }
    xhr.send(null)
  })
}

export function autoredraw(action: () => void): void {
  const res = action()
  redraw()
  return res
}

export function hasNetwork(): boolean {
  return window.navigator.connection.type !== Connection.NONE
}

export function handleXhrError(error: ErrorResponse): void {
  const status = error.status
  const data = error.body
  let message: string

  if (!status || status === 0)
    message = 'lichessIsUnreachable'
  else if (status === 401)
    message = 'unauthorizedError'
  else if (status === 404)
    message = 'resourceNotFoundError'
  else if (status === 503)
    message = 'lichessIsUnavailableError'
  else if (status >= 500)
    message = 'Server error.'
  else
    message = 'Error.'

  message = i18n(message)

  if (typeof data === 'string') {
    message += ` ${data}`
  }
  else if (data.global && data.global.constructor === Array) {
    message += ` ${i18n(data.global[0])}`
  }
  window.plugins.toast.show(message, 'short', 'center')
}

export function serializeQueryParameters(obj: StringMap): string {
  let str = ''
  const keys = Object.keys(obj)
  keys.forEach(key => {
    if (str !== '') {
      str += '&'
    }
    str += encodeURIComponent(key) + '=' + encodeURIComponent(obj[key])
  })
  return str
}

export function noop() {}

const perfIconsMap: {[index: string]: string} = {
  bullet: 'T',
  blitz: ')',
  classical: '+',
  correspondence: ';',
  chess960: '\'',
  kingOfTheHill: '(',
  threeCheck: '.',
  antichess: '@',
  atomic: '>',
  puzzle: '-',
  horde: '_',
  fromPosition: '*',
  racingKings: '',
  crazyhouse: '',
  ultraBullet: '{'
}

export function gameIcon(perf?: string): string {
  return perf ? perfIconsMap[perf] || '8' : '8'
}

export function secondsToMinutes(sec: number): number {
  return sec === 0 ? sec : sec / 60
}

export function tupleOf(x: number | string): [string, string] {
  return [x.toString(), x.toString()]
}

export function oppositeColor(color: Color): Color {
  return color === 'white' ? 'black' : 'white'
}

export function caseInsensitiveSort(a: string, b: string): number {
  const alow = a.toLowerCase()
  const blow = b.toLowerCase()

  return alow > blow ? 1 : (alow < blow ? -1 : 0)
}

export function userFullNameToId(fullName: string): string {
  const split = fullName.split(' ')
  const id = split.length === 1 ? split[0] : split[1]
  return id.toLowerCase()
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function getRandomArbitrary(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

export function boardOrientation(data: GameData, flip?: boolean): 'black' | 'white' {
  if (data.game.variant.key === 'racingKings') {
    return flip ? 'black' : 'white'
  } else {
    return flip ? data.opponent.color : data.player.color
  }
}

export function pad(num: number, size: number): string {
    let s = num + ''
    while (s.length < size) s = '0' + s
    return s
}

export function formatTimeInSecs(
  seconds: number,
  format: 'hour_min_secs' | 'secs_only' = 'hour_min_secs'
): string {
  let timeStr = ''
  const hours = Math.floor(seconds / 60 / 60)
  const mins = Math.floor(seconds / 60) - (hours * 60)
  const secs = seconds % 60
  if (format === 'hour_min_secs') {
    if (hours > 0) {
      timeStr = hours + ':' + pad(mins, 2) + ':' + pad(secs, 2)
    } else {
      timeStr = mins + ':' + pad(secs, 2)
    }
  } else {
    timeStr = pad(secs, 2)
  }

  return timeStr
}

export function formatTournamentDuration(timeInMin: number): string {
  const hours = Math.floor(timeInMin / 60)
  const minutes = Math.floor(timeInMin - hours * 60)
  return (hours ? hours + 'H ' : '') + (minutes ? minutes + 'M' : '')
}

export function formatTournamentTimeControl(clock: TournamentClock): string {
  if (clock) {
    const min = secondsToMinutes(clock.limit)
    const t = min === 0.5 ? '½' : min === 0.75 ? '¾' : min.toString()
    return t + '+' + clock.increment
  } else {
    return '∞'
  }
}

export function noNull<T>(v: T) {
  return v !== undefined && v !== null
}

export function flatten<T>(arr: T[][]): T[] {
  return arr.reduce((a: T[], b: T[]) => a.concat(b), [])
}

export function mapObject<K extends string, T, U>(obj: Record<K, T>, f: (x: T) => U): Record<K, U> {
  const res = {} as Record<K, U>
  Object.keys(obj).map((k: K) => res[k] = f(obj[k]))
  return res
}

export function lichessAssetSrc(path: string) {
  return `${globalConfig.apiEndPoint}/assets/${path}`
}

// Implementation originally from Twitter's Hogan.js:
// https://github.com/twitter/hogan.js/blob/master/lib/template.js#L325-L335
const rAmp = /&/g
const rLt = /</g
const rApos = /\'/g
const rQuot = /\"/g
const hChars = /[&<>\"\']/
export function escapeHtml(str: string) {
  if (hChars.test(String(str))) {
    return str
    .replace(rAmp, '&amp;')
    .replace(rLt, '&lt;')
    .replace(rApos, '&apos;')
    .replace(rQuot, '&quot;')
  }
  else {
    return str
  }
}

export function displayTime(time: string): string {
  if (time === '0.75') return '¾'
  if (time === '0.5') return '½'
  if (time === '0.25') return '¼'

  return time
}

export function truncate(text: string, len: number): string {
  return text.length > len ? text.slice(0, len) + '…' : text
}

export function safeStringToNum(s: string | null | undefined): number | undefined {
  const n = Number(s)
  return isNaN(n) ? undefined : n
}

/**
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * Returns true when the values of all keys are strictly equal.
 */
const hasOwnProperty = Object.prototype.hasOwnProperty
type OAny = { [k: string]: any }
export function shallowEqual(objA: OAny, objB: OAny): boolean {
  if (Object.is(objA, objB)) {
    return true
  }

  if (typeof objA !== 'object' || objA === null ||
      typeof objB !== 'object' || objB === null) {
    return false
  }

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) {
    return false
  }

  for (let i = 0; i < keysA.length; i++) {
    if (
      !hasOwnProperty.call(objB, keysA[i]) ||
      !Object.is(objA[keysA[i]], objB[keysA[i]])
    ) {
      return false
    }
  }

  return true
}
