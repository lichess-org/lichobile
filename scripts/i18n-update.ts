/* tslint:disable:semicolon */
import { readFileSync, createWriteStream, WriteStream, writeFileSync, fstat, existsSync, readdirSync, readdir, mkdirSync } from 'fs';
import { parseStringPromise } from 'xml2js';
import { get } from 'request';
import { exec } from 'child_process';
const colors = require('colors/safe');

const baseDir = 'tmp/translations';
const i18nBaseDir = '../www/i18n';
const unzipMaxBufferSize = 1024 * 1024 * 10; // Set maxbuffer to 10MB to avoid errors when default 1MB used

const modules = ['site', 'study', 'arena', 'preferences', 'settings', 'search', 'team', 'tfa', 'puzzle']

type StringMap = {
  [i: string]: string | undefined
}

async function main(args: string[]) {
  mkdirSync(`${baseDir}`, {recursive: true});

  // Download translations zip
  const zipFile = createWriteStream(`${baseDir}/out.zip`);
  downloadTranslationsTo(zipFile)
    .on('finish', async () => {

    await unzipTranslations(`${baseDir}/out.zip`);

    const locales = readdirSync(`${baseDir}/master/translation/dest/site`)
    .map(fn => fn.split('.')[0])

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

    const allKeys = Object.keys(everything)

    writeFileSync(`${i18nBaseDir}/refs.js`, 'export default ' + JSON.stringify(allKeys, null, 2));
    console.log(
      'Supported locales: ', allKeys.join(', ')
    );

    // Write flattened translation objects to file. Skip if it would remove one or more keys.
    allKeys.forEach(locale => {
      const newData = everything[locale];
      try {
        writeTranslations(`${i18nBaseDir}/${locale}.js`, newData);
      } catch (e) {
        console.error(colors.red(`Could not write translations for ${colors.bold(locale)}, skipping...`));
      }
    });
  });
}

function downloadTranslationsTo(zipFile: WriteStream) {
  console.log(colors.blue('Downloading translations...'));
  return get('https://crowdin.com/backend/download/project/lichess.zip')
    .pipe(zipFile)
    .on('finish', () => {
      console.log(colors.green('  Download complete.'));
    });
}

function unzipTranslations(zipFilePath: string) {
  console.log(colors.blue('Unzipping translations...'));
  return new Promise<void>((resolve, reject) => {
      exec(`unzip -o ${zipFilePath} -d ${baseDir}`, {maxBuffer: unzipMaxBufferSize}, (err, stdout, stderr) => {
      if (err) {
        return reject('Unzip failed.');
      }
      resolve();
    });
  });
}

function loadTranslations(dir: string, locale: string) {
  return parseStringPromise(
    readFileSync(`${baseDir}/master/translation/dest/${dir}/${locale}.xml`)
  );
}

function unescape(str: string) {
  return str.replace(/\\"/g, '"').replace(/\\'/g, '\'');
}

function transformTranslations(data: any, locale: string, section: string): Promise<StringMap> {
  console.log(colors.blue(`Transforming translations for ${colors.bold(locale)}...`));
  const flattenedTranslations = {};

  if (!(data && data.resources && data.resources.string)) {
    return Promise.reject(`Missing translations in section ${section} and locale ${locale}`);
  }

  data.resources.string.forEach((stringElement: any) => {
    flattenedTranslations[stringElement.$.name] = unescape(stringElement._);
  });

  (data.resources.plurals || []).forEach((plural: any) => {
    plural.item.forEach((child: any) => {
      flattenedTranslations[`${plural.$.name}:${child.$.quantity}`] = unescape(child._);
    });
  });

  return Promise.resolve(flattenedTranslations);
}

function writeTranslations(where: string, data: object) {
  console.log(colors.blue(`Writing to ${where}`));
  writeFileSync(where, 'export default ' + JSON.stringify(data, null, 2));
}

async function loadXml(locales: readonly string[], section: string) {
  const sectionXml = {}
  for (const idx in locales) {
    const locale = locales[idx]
    console.log(colors.blue(`Loading translations for ${colors.bold(locale)}...`))
    try {
      sectionXml[locale] = await loadTranslations(section, locale)
    } catch (_) {
      console.warn(colors.yellow(`Could not load ${section} translations for locale: ${locale}`))
    }
  }
  return sectionXml
}

main(process.argv);
