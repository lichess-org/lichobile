import { Plugins } from '@capacitor/core'
import { Locale } from 'date-fns'
import formatDistanceStrict from 'date-fns/esm/formatDistanceStrict'
import formatRelative from 'date-fns/esm/formatRelative'
import addSeconds from 'date-fns/esm/addSeconds'
import settings from './settings'
import { loadLocalJsonFile } from './utils'

const supportedDateLocales = ['ar-DZ', 'ar-SA', 'en-CA', 'en-GB', 'en-US', 'fa-IR', 'fr-CH', 'nl-BE', 'pt-BR', 'zh-CN', 'zh-TW']

const defaultCode = 'en'

let lang = defaultCode
let dateLocale: Locale | undefined
let messages = {} as StringMap
let numberFormat: Intl.NumberFormat = new Intl.NumberFormat()

const dateFormatOpts = { day: '2-digit', month: 'long', year: 'numeric' }
const dateTimeFormatOpts = { ...dateFormatOpts, hour: '2-digit', minute: '2-digit' }
let dateFormat: Intl.DateTimeFormat = new Intl.DateTimeFormat(undefined, dateFormatOpts)
let dateTimeFormat: Intl.DateTimeFormat = new Intl.DateTimeFormat(undefined, dateTimeFormatOpts)

export default function i18n(key: string, ...args: Array<string | number>): string {
  let str: string = messages[key] || untranslated[key] || key
  args.forEach(a => { str = str.replace('%s', String(a)) })
  return str
}

export function formatNumber(n: number): string {
  return numberFormat.format(n)
}

export function formatDate(d: Date): string {
  return dateFormat.format(d)
}

export function formatDateTime(d: Date): string {
  return dateTimeFormat.format(d)
}

export function formatDuration(duration: Seconds): string {
  const epoch = new Date(0)
  return formatDistanceStrict(
    epoch,
    addSeconds(epoch, duration),
    { locale: dateLocale },
  )
}

export function fromNow(date: Date): string {
  return formatRelative(date, new Date(), {
    locale: dateLocale
  })
}

export function getLang(): string {
  return lang
}

/*
 * Load either lang stored as a setting or default app language.
 * It is called during app initialization, when we don't know yet server lang
 * preference.
 */
export function loadPreferredLanguage(): Promise<string> {
  const fromSettings = settings.general.lang()
  if (fromSettings) {
    return loadLanguage(fromSettings)
  }

  return Plugins.Device.getLanguageCode()
  .then(({ value }) => {
    // TODO test
    console.log('language code', value)
    settings.general.lang(value)
    return value
  })
  .then(loadFile)
  .then(loadDateLocale)
}

export function getAvailableLanguages(): Promise<ReadonlyArray<[string, string]>> {
  return loadLocalJsonFile('i18n/refs.json')
}

export function ensureLangIsAvailable(lang: string): Promise<string> {
  return new Promise((resolve, reject) => {
    getAvailableLanguages()
    .then(langs => {
      const l = langs.find(l => l[0] === lang)
      if (l !== undefined) resolve(l[0])
      else reject(new Error(`Lang ${l} is not available in the application.`))
    })
  })

}

export function loadLanguage(lang: string): Promise<string> {
  return loadFile(lang)
  .then(loadDateLocale)
}

function loadFile(code: string): Promise<string> {
  return loadLocalJsonFile<StringMap>('i18n/' + code + '.json')
  .then(data => {
    lang = code
    messages = data
    numberFormat = new Intl.NumberFormat(code)
    dateFormat = new Intl.DateTimeFormat(code, dateFormatOpts)
    dateTimeFormat = new Intl.DateTimeFormat(code, dateTimeFormatOpts)
    return code
  })
  .catch(error => {
    if (code === defaultCode) throw new Error(error)
    return loadFile(defaultCode)
  })
}

function loadDateLocale(code: string): Promise<string> {
  const lCode = supportedDateLocales.includes(code) ? code : code.split('-')[0]
  return import('./locale/' + lCode + '/index.js')
  .then(module => {
    dateLocale = module.default || undefined
    return code
  })
  .catch(() => {
    dateLocale = undefined
    return code
  })
}

const untranslated: StringMap = {
  apiUnsupported: 'Your version of lichess app is too old! Please upgrade for free to the latest version.',
  apiDeprecated: 'Upgrade for free to the latest lichess app! Support for this version will be dropped on %s.',
  resourceNotFoundError: 'Resource not found.',
  lichessIsUnavailableError: 'lichess.org is temporarily down for maintenance.',
  lichessIsUnreachable: 'lichess.org is unreachable.',
  mustSignIn: 'You must sign in to see this.',
  mustSignInToJoin: 'You must sign in to join it.',
  boardThemeBrown: 'Brown',
  boardThemeBlue: 'Blue',
  boardThemeGreen: 'Green',
  boardThemeGrey: 'Grey',
  boardThemePurple: 'Purple',
  boardThemeWood: 'Wood',
  boardThemeWood2: 'Wood 2',
  boardThemeWood3: 'Wood 3',
  boardThemeMaple: 'Maple',
  boardThemeBlue2: 'Blue 2',
  boardThemeCanvas: 'Canvas',
  boardThemeMetal: 'Metal',
  bgThemeDark: 'Dark',
  bgThemeLight: 'Light',
  bgThemeWood: 'Wood',
  bgThemeShapes: 'Shapes',
  bgThemeAnthracite: 'Anthracite',
  bgThemeBlueMaze: 'Blue maze',
  bgThemeGreenMaze: 'Green maze',
  bgThemeRedMaze: 'Red maze',
  bgThemeGreenCheckerboard: 'Checkerboard',
  bgThemeCrackedEarth: 'Earth',
  bgThemeVioletSpace: 'Space',
  playerisInvitingYou: '%s is inviting you',
  toATypeGame: 'To a %s game',
  unsupportedVariant: 'Variant %s is not supported in this version',
  language: 'Language',
  notesSynchronizationHasFailed: 'Notes synchronization with lichess has failed, please try later.',
  challengeDeclined: 'Challenge declined',
  youAreChallenging: 'You are challenging %s',
  submitMove: 'Submit move',
  returnToHome: 'Return to home',
  enableLocalComputerEvaluation: 'Enable local computer evaluation',
  localEvalCaution: 'Caution: intensive usage will drain battery.',
  showBestMove: 'Show computer best move',
  followers: 'Followers',
  userAcceptsYourChallenge: '%s accepts your challenge!',
  incorrectThreefoldClaim: 'Incorrect threefold repetition claim.',
  notifications: 'Notifications',
  vibrationOnNotification: 'Vibrate on notification',
  soundOnNotification: 'Play sound on notification',
  vibrateOnGameEvents: 'Vibrate on game events',
  soundAndNotifications: 'Sound and notifications',
  usernameStartNoNumber: 'The username must not start with a number',
  usernameUnacceptable: 'This username is not acceptable',
  usernameInvalid: 'The username contains invalid characters',
  offline: 'Offline'
}
