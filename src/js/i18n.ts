import settings from './settings';
import { loadLocalJsonFile } from './utils';

let messages: { [key: string]: string } = {};

const untranslated: {[key: string]: string} = {
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
  localEvalCaution: 'Caution: it may be slow, and intensive usage will drain more battery.',
  showBestMove: 'Show computer best move',
  followers: 'Followers',
  userAcceptsYourChallenge: '%s accepts your challenge!',
  incorrectThreefoldClaim: 'Incorrect threefold repetition claim.',
  notifications: 'Notifications',
  vibrationOnNotification: 'Vibrate on notification',
  soundOnNotification: 'Play sound on notification',
  vibrateOnGameEvents: 'Vibrate on game events',
  soundAndNotifications: 'Sound and notifications',
  offline: 'Offline'
};

const defaultCode = 'en';

export default function i18n(key: string, ...args: Array<string | number>): string {
  let str: string = messages[key] || untranslated[key] || key;
  args.forEach(a => { str = str.replace('%s', String(a)); })
  return str;
}

export function loadPreferredLanguage(): Promise<string> {
  if (settings.general.lang()) {
    return loadFromSettings();
  }

  return new Promise(resolve => {
    window.navigator.globalization.getPreferredLanguage(
      l => resolve(l.value.split('-')[0]),
      () => resolve(defaultCode)
    );
  })
  .then((code: string) => {
    settings.general.lang(code);
    return code;
  })
  .then(loadFile)
  .then(loadMomentLocale);
}

export function getAvailableLanguages(): Promise<Array<[string, string]>> {
  return loadLocalJsonFile('i18n/refs.json');
}

export function loadFromSettings(): Promise<string> {
  return loadFile(settings.general.lang())
  .then(loadMomentLocale);
}

function loadFile(code: string): Promise<string> {
  return loadLocalJsonFile('i18n/' + code + '.json')
  .then(data => {
    messages = data;
    return code;
  })
  .catch(error => {
    if (code === defaultCode) throw new Error(error);
    return loadFile(defaultCode);
  });
}

function loadMomentLocale(code: string): string {
  if (code !== 'en') {
    const script = document.createElement('script');
    script.src = 'moment/locale/' + code + '.js';
    document.head.appendChild(script);
  }
  window.moment.locale(code);
  return code;
}
