import { Plugins, NetworkStatus } from '@capacitor/core'
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

function isScriptLoaded(url: string) {
  const scripts = document.head.getElementsByTagName('script')
  for (let i = 0, len = scripts.length; i < len; i++) {
    if (scripts[i].getAttribute('src') === url) {
      return true
    }
  }
  return false
}

function isCssLoaded(url: string) {
  const links = document.head.getElementsByTagName('link')
  for (let i = 0, len = links.length; i < len; i++) {
    if (links[i].getAttribute('href') === url) {
      return true
    }
  }
  return false
}

export function loadScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isScriptLoaded(url)) {
      const script = document.createElement('script')
      script.src = url
      script.onload = () => resolve()
      script.onerror = () => reject()
      document.head.appendChild(script)
    } else {
      setTimeout(resolve, 0)
    }
  })
}

export function loadCss(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isCssLoaded(url)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.type = 'text/css'
      link.href = url
      link.onload = () => resolve()
      link.onerror = () => reject()
      document.head.appendChild(link)
    } else {
      setTimeout(resolve, 0)
    }
  })
}

export function autoredraw(action: () => void): void {
  const res = action()
  redraw()
  return res
}

let networkStatus: NetworkStatus
Plugins.Network.addListener('networkStatusChange', st => {
  networkStatus = st
})
Plugins.Network.getStatus().then(st => {
  networkStatus = st
})

export function hasNetwork(): boolean {
  return networkStatus.connected
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

  if (data) {
    if (typeof data === 'string') {
      message += ` ${data}`
    }
    else if (typeof data.error === 'string') {
      message += ` ${data.error}`
    }
    else if (data.global && data.global.constructor === Array) {
      message += ` ${i18n(data.global[0])}`
    }
  }

  Plugins.LiToast.show({ text: message, duration: 'short' })
}

export function serializeQueryParameters(obj: StringMap): string {
  let str = ''
  const keys = Object.keys(obj)
  keys.forEach(key => {
    const val = obj[key]
    if (val !== null && val !== undefined) {
      if (str !== '') {
        str += '&'
      }
      str += encodeURIComponent(key) + '=' + encodeURIComponent(val)
    }
  })
  return str
}

export function noop() { /* noop */ }

const perfIconsMap: {[index: string]: string} = {
  bullet: 'T',
  blitz: ')',
  rapid: '#',
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
  ultraBullet: '{',
  computer: 'n',
  bot: 'n',
}

export function gameIcon(perf?: PerfKey | VariantKey): string {
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
    const t = min === 0.25 ? '¼' : min === 0.5 ? '½' : min === 0.75 ? '¾' : min.toString()
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

export function lichessAssetSrc(path: string) {
  return `${globalConfig.apiEndPoint}/assets/${path}`
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

function charToInt(char: string) {
  const i = char.charCodeAt(0)
  if (i > 96) {
    return i - 71
  } else if (i > 64) {
    return i - 65
  }
  return i + 4
}

export function base62ToNumber(id?: string): number | undefined {
  // Server idSize is 5 at the time of writing, but we'll be lenient
  if (id === undefined || id.length > 7 || id.length === 0 || id.match(/[^a-zA-Z0-9]/)) {
    return undefined
  }

  return id.split('').reduce((output, char, i) => {
    return output + charToInt(char) * Math.pow(62, i)
  }, 0)
}

export function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash
}

export const requestIdleCallback: (c: () => void) => void =
  window.requestIdleCallback || window.setTimeout

type PropParam<T> = Exclude<T, undefined>
export interface Prop<T> {
  (v?: PropParam<T>): T
}
export function prop<A>(initialValue: PropParam<A>): Prop<A> {
  let value = initialValue
  return (v?: PropParam<A>) => {
    if (v !== undefined) value = v
    return value
  }
}

export function animationDuration(pref: boolean): number {
  return pref ? 250 : 0
  // const base = 250
  // switch (pref) {
  //   case 0:
  //     return 0
  //   case 1:
  //     return base * 0.5
  //   case 2:
  //     return base
  //   case 3:
  //     return base * 2
  //   default:
  //     return base
  // }
}
