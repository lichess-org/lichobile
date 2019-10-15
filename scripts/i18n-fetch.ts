/* tslint:disable:semicolon */
import { readFileSync, createWriteStream, WriteStream, writeFileSync, fstat, existsSync, readdirSync, readdir, mkdirSync } from 'fs';
import { parseStringPromise } from 'xml2js';
import { get } from 'request';
import { exec } from 'child_process';
const colors = require('colors/safe');

const baseDir = 'tmp/translations';
const i18nBaseDir = '../www/i18n';

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
  return new Promise((resolve, reject) => {
      exec(`unzip -o ${zipFilePath} -d ${baseDir}`, (err, stdout, stderr) => {
      if (err) {
        return reject('Unzip failed.');
      }
      resolve();
    });
  });
}

function loadTranslations(locale: string) {
  console.log(colors.blue(`Loading translations for ${colors.bold(locale)}...`));

  return parseStringPromise(readFileSync(`${baseDir}/master/translation/dest/site/${locale}.xml`));
}

function unescape(str) {
  return str.replace('\\', '');
}

function transformTranslations(data: any, locale: string) {
  console.log(colors.blue(`Transforming translations for ${colors.bold(locale)}...`));
  const flattenedTranslations = {};

  if (!(data && data.resources && data.resources.string)) {
    console.log(data);
    return Promise.reject(`Malformed translations in locale: ${locale}`);
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

async function main(args: string[]) {
  mkdirSync(`${baseDir}`, {recursive: true});

  // Download translations zip
  const zipFile = createWriteStream(`${baseDir}/out.zip`);
  downloadTranslationsTo(zipFile)
    .on('finish', async () => {

    await unzipTranslations(`${baseDir}/out.zip`);

    const locales = readdirSync(`${baseDir}/master/translation/dest/site`)
    .map(fn => fn.split('.')[0])

    // Load XML
    const localeToXml = {};
    for (const idx in locales) {
      const locale = locales[idx];
      localeToXml[locale] = await loadTranslations(locale);
    }

    // Flatten plurals, etc.
    const localeToFlattened = {};
    for (const locale in localeToXml) {
      if (localeToXml[locale]) {
        try {
          localeToFlattened[locale] = await transformTranslations(localeToXml[locale], locale);
        } catch (e) {
          console.error(e);
        }
      }
    }

    const allKeys = Object.keys(localeToFlattened);

    writeFileSync(`${i18nBaseDir}/refs.js`, 'export default ' + JSON.stringify(allKeys, null, 2));
    console.log(
      'Supported locales: ', allKeys.join(', ')
    );

    // Write flattened translation objects to file. Skip if it would remove one or more keys.
    allKeys.forEach(locale => {
      const newData = localeToFlattened[locale];
      try {
        writeTranslations(`${i18nBaseDir}/${locale}.js`, newData);
      } catch (e) {
        console.error(colors.red(`Could not write translations for ${colors.bold(locale)}, skipping...`));
      }
    });
  });
}

main(process.argv);
