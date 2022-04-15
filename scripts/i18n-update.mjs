import { readFileSync, createWriteStream, writeFileSync, readdirSync, mkdirSync, existsSync } from 'fs'
import { pipeline } from 'stream'
import { promisify } from 'util'
import { exec } from 'child_process'
import colors from 'colors/safe.js'
import { load as loadYaml } from 'js-yaml'
import { parseStringPromise } from 'xml2js'
import fetch from 'node-fetch'
import { request as octokitRequest } from '@octokit/request'

const baseDir = 'tmp/translations'
const i18nBaseDir = '../www/i18n'
const lilaSourcePath = `${baseDir}/source`
const lilaTranslationsPath = `${baseDir}/[ornicar.lila] master/translation/dest`
const lichobileTranslationsPath = '../translation/dest/'
const unzipMaxBufferSize = 1024 * 1024 * 10 // Set maxbuffer to 10MB to avoid errors when default 1MB used

const modules = ['site', 'study', 'arena', 'perfStat', 'preferences', 'settings', 'search', 'team', 'tfa', 'puzzle', 'coordinates', 'challenge', 'ublog']

async function main() {
  mkdirSync(`${baseDir}`, {recursive: true})

  // Download translations zip from crowdin
  const zipFile = createWriteStream(`${baseDir}/out.zip`)
  await downloadTranslationsTo(zipFile)
  await unzipTranslations(`${baseDir}/out.zip`)

  // Download source translations (en-GB) from lila repo
  await downloadLilaSourcesTo(baseDir)

  // en-GB is the source locale, thus it has a special treatment
  const locales = ['en-GB'].concat(readdirSync(`${lilaTranslationsPath}/site`)
  .map(fn => fn.split('.')[0]))

  // load and flatten translations in one object
  const everything = {}
  for (const section of modules) {
    const xml = await loadXml(locales, section)
    for (const locale in xml) {
      try {
        const trans = await transformTranslations(xml[locale], locale, section)
        everything[locale] = {
          ...everything[locale],
          ...trans
        }
      } catch (e) {
        console.error(e)
      }
    }
  }

  const mobileTranslations = loadMobileTranslations()
  for (const locale in mobileTranslations) {
    everything[locale] = {
      ...everything[locale],
      ...mobileTranslations[locale],
    }
  }

  const allKeys = Object.keys(everything)

  // Write flattened translation objects to file. Skip if it would remove one or more keys.
  allKeys.forEach(locale => {
    const newData = everything[locale]
    try {
      writeTranslations(`${i18nBaseDir}/${locale}.js`, newData)
    } catch (e) {
      console.error(colors.red(`Could not write translations for ${colors.bold(locale)}, skipping...`))
    }
  })
}

async function downloadTranslationsTo(zipFile) {
  console.log(colors.blue('Downloading translations...'))
  const streamPipeline = promisify(pipeline)
  const response = await fetch('https://crowdin.com/backend/download/project/lichess.zip')
  if (!response.ok) throw new Error(`unexpected response ${response.statusText}`)

  await streamPipeline(response.body, zipFile)
  console.log(colors.green('  Download complete.'))
}

async function unzipTranslations(zipFilePath) {
  console.log(colors.blue('Unzipping translations...'))
  return new Promise((resolve, reject) => {
      exec(`unzip -o ${zipFilePath} -d ${baseDir}`, {maxBuffer: unzipMaxBufferSize}, (err) => {
      if (err) {
        return reject('Unzip failed.')
      }
      resolve()
    })
  })
}

async function downloadLilaSourcesTo(dir) {
  console.log(colors.blue('Downloading lila source translations...'))
  const response = await octokitRequest('GET /repos/{owner}/{repo}/contents/{path}', {
    owner: 'lichess-org',
    repo: 'lila',
    path: 'translation/source'
  })
  if (!existsSync(`${dir}/source`)) mkdirSync(`${dir}/source`)
  for (const entry of response.data) {
    const streamPipeline = promisify(pipeline)
    const response = await fetch(entry.download_url)
    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`)
    await streamPipeline(response.body, createWriteStream(`${dir}/source/${entry.name}`))
  }
  console.log(colors.green('  Download complete.'))
}

function loadTranslations(dir, locale) {
  if (locale === 'en-GB')
    return parseStringPromise(
      readFileSync(`${lilaSourcePath}/${dir}.xml`)
    )
  else
    return parseStringPromise(
      readFileSync(`${lilaTranslationsPath}/${dir}/${locale}.xml`)
    )
}

function unescape(str) {
  return str.replace(/\\"/g, '"').replace(/\\'/g, '\'')
}

function transformTranslations(data, locale, section) {
  console.log(colors.blue(`Transforming translations for ${colors.bold(locale)}...`))
  const flattenedTranslations = {}

  if (!(data && data.resources && data.resources.string)) {
    return Promise.reject(`Missing translations in section ${section} and locale ${locale}`)
  }

  data.resources.string.forEach((stringElement) => {
    flattenedTranslations[stringElement.$.name] = unescape(stringElement._)
  });

  (data.resources.plurals || []).forEach((plural) => {
    plural.item.forEach((child) => {
      flattenedTranslations[`${plural.$.name}:${child.$.quantity}`] = unescape(child._)
    })
  })

  return Promise.resolve(flattenedTranslations)
}

function writeTranslations(where, data) {
  console.log(colors.blue(`Writing to ${where}`))
  writeFileSync(where, 'export default ' + JSON.stringify(data, null, 2))
}

async function loadXml(locales, section) {
  const sectionXml = {}
  for (const locale of locales) {
    console.log(colors.blue(`Loading translations for ${colors.bold(locale)}...`))
    try {
      sectionXml[locale] = await loadTranslations(section, locale)
    } catch (_) {
      console.warn(colors.yellow(`Could not load ${section} translations for locale: ${locale}`))
    }
  }
  return sectionXml
}

function loadMobileTranslations() {
  const localeMap = new Map()

  const enGBData = 
    loadYaml(readFileSync('../translation/source/mobile-misc.yaml', 'utf8'))['en-GB']
  localeMap['en-GB'] = transformMobileTranslations(enGBData)

  for (const locale of readdirSync(lichobileTranslationsPath)) {
    if (locale !== 'README.md') {
      const translations = loadMobileTranslationsForLocale(locale)
      if (!isEmpty(translations)) {
        localeMap[locale] = translations
      }
    }
  }

  return localeMap
}

function loadMobileTranslationsForLocale(locale) {
  let translationMap = {}
  const localeDir = `${lichobileTranslationsPath}/${locale}`
  
  for (const file of readdirSync(localeDir)) {
    const data = loadYaml(readFileSync(`${localeDir}/${file}`, 'utf8'))[locale]
    translationMap = {
      ...translationMap,
      ...transformMobileTranslations(data)
    }
  }

  return translationMap
}

function transformMobileTranslations(data) {
  let translationMap = {}
  for (const key in data) {
    const value = data[key]
    if (typeof value === 'string') {
      translationMap[key] = value
    } else {
      // flatten plurals
      for (const pluralType in value) {
        translationMap[`${key}:${pluralType}`] = value[pluralType]
      }
    }
  }
  return translationMap
}

function isEmpty(obj) {
  return obj && Object.keys(obj).length === 0
}

main()
