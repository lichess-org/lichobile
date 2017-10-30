import settings from './settings'
import { loadLocalJsonFile } from './utils'

const defaultCode = 'en'

let lang = defaultCode
let messages = {} as StringMap

export default function i18n(key: string, ...args: Array<string | number>): string {
  let str: string = messages[key] || untranslated[key] || key
  args.forEach(a => { str = str.replace('%s', String(a)) })
  return str
}

export function getLang(): string {
  return lang
}

export function loadPreferredLanguage(): Promise<string> {
  const fromSettings = settings.general.lang()
  if (fromSettings) {
    return loadLanguage(fromSettings)
  }

  return new Promise(resolve => {
    window.navigator.globalization.getPreferredLanguage(
      l => resolve(l.value.split('-')[0]),
      () => resolve(defaultCode)
    )
  })
  .then((code: string) => {
    settings.general.lang(code)
    return code
  })
  .then(loadFile)
  .then(loadMomentLocale)
}

export function getAvailableLanguages(): Promise<Array<[string, string]>> {
  return loadLocalJsonFile('i18n/refs.json')
}

export function loadLanguage(lang: string): Promise<string> {
  return loadFile(lang)
  .then(loadMomentLocale)
}

function loadFile(code: string): Promise<string> {
  return loadLocalJsonFile<StringMap>('i18n/' + code + '.json')
  .then(data => {
    lang = code
    messages = data
    return code
  })
  .catch(error => {
    if (code === defaultCode) throw new Error(error)
    return loadFile(defaultCode)
  })
}

function loadMomentLocale(code: string): string {
  if (code !== 'en') {
    const script = document.createElement('script')
    script.src = 'locale/' + code + '.js'
    document.head.appendChild(script)
  }
  window.moment.locale(code)
  return code
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
  persistentChallengeCreated: 'Correspondence challenge created. It will remain active for two weeks. You will get notified when your friend accepts it. You can cancel it from the "Correspondence" page.',
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
