import { Device } from '@capacitor/device'
import { Locale } from 'date-fns'
import formatDistanceStrict from 'date-fns/esm/formatDistanceStrict'
import formatRelative from 'date-fns/esm/formatRelative'
import addSeconds from 'date-fns/esm/addSeconds'
import settings from './settings'
import formatDistanceToNowStrict from 'date-fns/esm/formatDistanceToNowStrict'

type Quantity = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other'

const defaultLocale = 'en-GB'
const englishMessages: StringMap = {}
const dateFormatOpts = { day: '2-digit', month: 'long', year: 'numeric' }
const dateTimeFormatOpts = { ...dateFormatOpts, hour: '2-digit', minute: '2-digit' }

let currentLocale: string = defaultLocale
let dateLocale: Locale | undefined
let messages: StringMap = {} as StringMap
let numberFormat: Intl.NumberFormat = new Intl.NumberFormat()
let dateFormat: Intl.DateTimeFormat = new Intl.DateTimeFormat(undefined, dateFormatOpts)
let dateTimeFormat: Intl.DateTimeFormat = new Intl.DateTimeFormat(undefined, dateTimeFormatOpts)

export default function i18n(key: string, ...args: Array<string | number>): string {
  const str = messages[key] || untranslated[key]
  return str ? format(str, ...args) : key
}

export function i18nVdom(key: string, ...args: Array<Mithril.Child>): Mithril.Children {
  const str = messages[key] || untranslated[key]
  return str ? formatVdom(str, ...args) : key
}

export function plural(key: string, count: number, replaceWith?: string): string {
  const pluralKey = key + ':' + quantity(currentLocale, count)
  const str = messages[pluralKey] || messages[key + ':other'] || messages[key]
  return str ? format(str, replaceWith !== undefined ? replaceWith : count) : key
}

function format(message: string, ...args: Array<string | number>): string {
  let str = message
  if (args.length) {
    if (str.includes('$s')) {
      for (let i = 1; i < 4; i++) {
        str = str.replace('%' + i + '$s', String(args[i - 1]))
      }
    }
    for (const arg of args) {
      str = str.replace('%s', String(arg))
    }
  }
  return str
}

function formatVdom(str: string, ...args: Array<Mithril.Child>): Mithril.Children {
  const segments: Array<Mithril.Child> = str.split(/(%(?:\d\$)?s)/g)
  for (let i = 1; i <= args.length; i++) {
    const pos = segments.indexOf('%' + i + '$s')
    if (pos !== -1) segments[pos] = args[i - 1]
  }
  for (let i = 0; i < args.length; i++) {
    const pos = segments.indexOf('%s')
    if (pos === -1) break
    segments[pos] = args[i]
  }
  return segments
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

export function distanceToNowStrict(date: Date, addSuffix = false): string {
  return formatDistanceToNowStrict(date, {
    locale: dateLocale,
    addSuffix: addSuffix,
  })
}

function getLanguage(locale: string): string {
  return locale.split('-')[0]
}

export function getDefaultLocaleForLang(lang: string): string | undefined {
  return defaultRegions[lang] || allKeys.find(k => getLanguage(k) === lang)
}

export function getCurrentLocale(): string {
  return currentLocale
}

/*
 * Call this once during app init.
 * Load english messages, they must always be there.
 * Load either lang stored as a setting or default app language.
 * It is called during app initialization, when we don't know yet server lang
 * preference.
 */
export async function init(): Promise<string> {

  // must use concat with defaultLocale const to force runtime module resolution
  const englishPromise = import('./i18n/' + defaultLocale + '.js')
  .then(({ default: data }) => {
    Object.assign(englishMessages, data)
  })

  const fromSettings = settings.general.locale()

  if (fromSettings && allLocales[fromSettings] !== undefined) {
    return englishPromise.then(() => loadLanguage(fromSettings))
  } else {
    return englishPromise
    .then(() => Device.getLanguageCode())
    .then(({ value }) => loadLanguage(getDefaultLocaleForLang(value) || defaultLocale))
  }
}

export function isLocaleAvailable(locale: string): boolean {
  return allLocales[locale] !== undefined
}

export function loadLanguage(locale: string): Promise<string> {
  return loadFile(locale)
  .then(settings.general.locale)
  .then(() => loadDateLocale(locale))
}

function loadFile(locale: string): Promise<string> {
  const availLocale = allLocales[locale] ? locale : defaultLocale
  console.info('Load language', availLocale)
  return import('./i18n/' + availLocale + '.js')
  .then(({ default: data }) => {
    currentLocale = availLocale
    // some translation files don't have all the keys, merge with english
    // messages to keep a fallback to english
    messages = {
      ...englishMessages,
      ...data,
    }
    numberFormat = new Intl.NumberFormat(availLocale)
    dateFormat = new Intl.DateTimeFormat(availLocale, dateFormatOpts)
    dateTimeFormat = new Intl.DateTimeFormat(availLocale, dateTimeFormatOpts)
    return availLocale
  })
}

// supported date-fns locales with region
const supportedDateLocales = ['ar-DZ', 'ar-MA', 'ar-SA', 'en-AU', 'en-CA', 'en-GB', 'en-IN', 'en-US', 'fa-IR', 'fr-CA', 'fr-CH', 'nl-BE', 'pt-BR', 'zh-CN', 'zh-TW']

function loadDateLocale(locale: string): Promise<string> {
  if (locale === defaultLocale) return Promise.resolve(locale)

  const lCode = supportedDateLocales.includes(locale) ? locale : getLanguage(locale)
  return import(`./i18n/date/${lCode}.js`)
  .then(module => {
    dateLocale = module.default || undefined
    return locale
  })
  .catch(() => {
    dateLocale = undefined
    return locale
  })
}

function quantity(locale: string, c: number): Quantity {
  const rem100 = c % 100
  const rem10 = c % 10
  const code = getLanguage(locale)
  switch (code) {
    // french
    case 'fr':
    case 'ff':
    case 'kab':
      return c < 2 ? 'one' : 'other'
    // czech
    case 'cs':
    case 'sk':
      if (c === 1) return 'one'
      else if (c >= 2 && c <= 4) return 'few'
      else return 'other'
    // balkan
    case 'hr':
    case 'ru':
    case 'sr':
    case 'uk':
    case 'be':
    case 'bs':
    case 'sh':
      if (rem10 === 1 && rem100 !== 11) return 'one'
      else if (rem10 >= 2 && rem10 <= 4 && !(rem100 >= 12 && rem100 <= 14)) return 'few'
      else if (rem10 === 0 || (rem10 >= 5 && rem10 <= 9) || (rem100 >= 11 && rem100 <= 14)) return 'many'
      else return 'other'
    // latvian
    case 'lv':
      if (c === 0) return 'zero'
      else if (c % 10 === 1 && c % 100 !== 11) return 'one'
      else return 'other'
    // lithuanian
    case 'lt':
      if (rem10 === 1 && !(rem100 >= 11 && rem100 <= 19)) return 'one'
      else if (rem10 >= 2 && rem10 <= 9 && !(rem100 >= 11 && rem100 <= 19)) return 'few'
      else return 'other'
    // polish
    case 'pl':
      if (c === 1) return 'one'
      else if (rem10 >= 2 && rem10 <= 4 && !(rem100 >= 12 && rem100 <= 14)) return 'few'
      else return 'other'
    // romanian
    case 'ro':
    case 'mo':
      if (c === 1) return 'one'
      else if ((c === 0 || (rem100 >= 1 && rem100 <= 19))) return 'few'
      else return 'other'
    // slovenian
    case 'sl':
      if (rem100 === 1) return 'one'
      else if (rem100 === 2) return 'two'
      else if (rem100 >= 3 && rem100 <= 4) return 'few'
      else return 'other'
    // arabic
    case 'ar':
      if (c === 0) return 'zero'
      else if (c === 1) return 'one'
      else if (c === 2) return 'two'
      else if (rem100 >= 3 && rem100 <= 10) return 'few'
      else if (rem100 >= 11 && rem100 <= 99) return 'many'
      else return 'other'
    // macedonian
    case 'mk':
      return (c % 10 === 1 && c !== 11) ? 'one' : 'other'
    // welsh
    case 'cy':
    case 'br':
      if (c === 0) return 'zero'
      else if (c === 1) return 'one'
      else if (c === 2) return 'two'
      else if (c === 3) return 'few'
      else if (c === 6) return 'many'
      else return 'other'
    // maltese
    case 'mt':
      if (c === 1) return 'one'
      else if (c === 0 || (rem100 >= 2 && rem100 <= 10)) return 'few'
      else if (rem100 >= 11 && rem100 <= 19) return 'many'
      else return 'other'
    // two
    case 'ga':
    case 'se':
    case 'sma':
    case 'smi':
    case 'smj':
    case 'smn':
    case 'sms':
      if (c === 1) return 'one'
      else if (c === 2) return 'two'
      else return 'other'
    // zero
    case 'ak':
    case 'am':
    case 'bh':
    case 'fil':
    case 'tl':
    case 'guw':
    case 'hi':
    case 'ln':
    case 'mg':
    case 'nso':
    case 'ti':
    case 'wa':
      return (c === 0 || c === 1) ? 'one' : 'other'
    // none
    case 'az':
    case 'bm':
    case 'fa':
    case 'ig':
    case 'hu':
    case 'ja':
    case 'kde':
    case 'kea':
    case 'ko':
    case 'my':
    case 'ses':
    case 'sg':
    case 'to':
    case 'tr':
    case 'vi':
    case 'wo':
    case 'yo':
    case 'zh':
    case 'bo':
    case 'dz':
    case 'id':
    case 'jv':
    case 'ka':
    case 'km':
    case 'kn':
    case 'ms':
    case 'th':
    case 'tp':
    case 'io':
    case 'ia':
      return 'other'
    default:
      return c === 1 ? 'one' : 'other'
  }
}

export const allLocales: StringMap = {
  'af-ZA': 'Afrikaans',
  'an-ES': 'aragonés',
  'ar-SA': 'العربية',
  'as-IN': 'অসমীয়া',
  'az-AZ': 'Azərbaycanca',
  'be-BY': 'Беларуская',
  'bg-BG': 'български език',
  'bn-BD': 'বাংলা',
  'br-FR': 'brezhoneg',
  'bs-BA': 'bosanski',
  'ca-ES': 'Català, valencià',
  'cs-CZ': 'čeština',
  'cv-CU': 'чӑваш чӗлхи',
  'cy-GB': 'Cymraeg',
  'da-DK': 'Dansk',
  'de-CH': 'Schwiizerdüütsch',
  'de-DE': 'Deutsch',
  'el-GR': 'Ελληνικά',
  'en-GB': 'English',
  'en-US': 'English (US)',
  'eo-UY': 'Esperanto',
  'es-ES': 'español',
  'et-EE': 'eesti keel',
  'eu-ES': 'Euskara',
  'fa-IR': 'فارسی',
  'fi-FI': 'suomen kieli',
  'fo-FO': 'føroyskt',
  'fr-FR': 'français',
  'frp-IT': 'arpitan',
  'fy-NL': 'Frysk',
  'ga-IE': 'Gaeilge',
  'gd-GB': 'Gàidhlig',
  'gl-ES': 'Galego',
  'gu-IN': 'ગુજરાતી',
  'he-IL': 'עִבְרִית',
  'hi-IN': 'हिन्दी, हिंदी',
  'hr-HR': 'hrvatski',
  'hu-HU': 'Magyar',
  'hy-AM': 'Հայերեն',
  'ia-IA': 'Interlingua',
  'id-ID': 'Bahasa Indonesia',
  'io-EN': 'Ido',
  'is-IS': 'Íslenska',
  'it-IT': 'Italiano',
  'ja-JP': '日本語',
  'jbo-EN': 'lojban',
  'jv-ID': 'basa Jawa',
  'ka-GE': 'ქართული',
  'kab-DZ': 'Taqvaylit',
  'kk-KZ': 'қазақша',
  'kmr-TR': 'Kurdî (Kurmancî)',
  'kn-IN': 'ಕನ್ನಡ',
  'ko-KR': '한국어',
  'ky-KG': 'кыргызча',
  'la-LA': 'lingua Latina',
  'lb-LU': 'Lëtzebuergesch',
  'lt-LT': 'lietuvių kalba',
  'lv-LV': 'latviešu valoda',
  'mg-MG': 'fiteny malagasy',
  'mk-MK': 'македонски јази',
  'ml-IN': 'മലയാളം',
  'mn-MN': 'монгол',
  'mr-IN': 'मराठी',
  'nb-NO': 'Norsk bokmål',
  'ne-NP': 'नेपाली',
  'nl-NL': 'Nederlands',
  'nn-NO': 'Norsk nynorsk',
  'pi-IN': 'पालि',
  'pl-PL': 'polski',
  'ps-AF': 'پښتو',
  'pt-PT': 'Português',
  'pt-BR': 'Português (BR)',
  'ro-RO': 'Română',
  'ru-RU': 'русский язык',
  'sa-IN': 'संस्कृत',
  'sk-SK': 'slovenčina',
  'sl-SI': 'slovenščina',
  'sq-AL': 'Shqip',
  'sr-SP': 'Српски језик',
  'sv-SE': 'svenska',
  'sw-KE': 'Kiswahili',
  'ta-IN': 'தமிழ்',
  'tg-TJ': 'тоҷикӣ',
  'th-TH': 'ไทย',
  'tk-TM': 'Türkmençe',
  'tl-PH': 'Tagalog',
  'tp-TP': 'toki pona',
  'tr-TR': 'Türkçe',
  'uk-UA': 'українська',
  'ur-PK': 'اُردُو',
  'uz-UZ': 'oʻzbekcha',
  'vi-VN': 'Tiếng Việt',
  'yo-NG': 'Yorùbá',
  'zh-CN': '中文',
  'zh-TW': '繁體中文',
  'zu-ZA': 'isiZulu'
}

export const allKeys = Object.keys(allLocales)

const defaultRegions: StringMap = {
  'de': 'de-DE',
  'en': 'en-US',
  'pt': 'pt-PT',
  'zh': 'zh-CN',
}

const untranslated: StringMap = {
  apiUnsupported: 'Your version of lichess app is too old! Please upgrade for free to the latest version.',
  apiDeprecated: 'Upgrade for free to the latest lichess app! Support for this version will be dropped on %s.',
  playerisInvitingYou: '%s is inviting you',
  unsupportedVariant: 'Variant %s is not supported in this version',
  notesSynchronizationHasFailed: 'Notes synchronization with lichess has failed, please try later.',
  localEvalCaution: 'Caution: intensive usage will drain battery.',
  incorrectThreefoldClaim: 'Incorrect threefold repetition claim.',
  vibrateOnGameEvents: 'Vibrate on game events',
  offline: 'Offline'
}
