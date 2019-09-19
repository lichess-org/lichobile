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

function loadTranslations(locale: string, destLocales: string[]) {
  console.log(colors.blue(`Loading translations for ${colors.bold(locale)}...`));

  // look for exact match first, then the first "locale-*"
  const matchingLocale =
    destLocales.find((destLocale: string) => destLocale == locale) ||
    destLocales.find((destLocale: string) => destLocale.split('-')[0] == locale);

  if (!matchingLocale) {
    console.error(colors.red(`  Could not find lila translation for ${colors.bold(locale)}.`));
    return Promise.resolve();
  } else if (matchingLocale != locale) {
    console.log(colors.yellow(`  Using ${colors.bold(matchingLocale)} for ${colors.bold(locale)}.`))
  }

  return parseStringPromise(readFileSync(`${baseDir}/master/translation/dest/site/${matchingLocale}.xml`));
}

function unescape(str) {
  return str.replace('\\', '');
}

function transformTranslations(data: any, locale: string) {
  console.log(colors.blue(`Transforming translations for ${colors.bold(locale)}...`));
  const flattenedTranslations = {};

  if (!(data && data.resources && data.resources.string)) {
    console.log(data);
    return Promise.reject('Malformed translations');
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
  writeFileSync(where, JSON.stringify(data));
}

async function main(args: string[]) {
  mkdirSync(`${baseDir}`, {recursive: true});

  // Download translations zip
  const zipFile = createWriteStream(`${baseDir}/out.zip`);
  downloadTranslationsTo(zipFile)
    .on('finish', async () => {

    await unzipTranslations(`${baseDir}/out.zip`);

    // List available lila translations.
    const locales = readdirSync(i18nBaseDir)
      .map((fileName: string) => fileName.split('.')[0])
      .filter(locale => args.length == 2 ? true : args.includes(locale));

    // Match lichobile translations to lila translations.
    const destLocales = readdirSync(`${baseDir}/master/translation/dest/site`).map((fileName) => fileName.split('.')[0]);

    // Load XML
    const localeToXml = {};
    for (const idx in locales) {
      const locale = locales[idx];
      localeToXml[locale] = await loadTranslations(locale, destLocales);
    }

    // Flatten plurals, etc.
    const localeToFlattened = {};
    for (const locale in localeToXml) {
      if (localeToXml[locale]) {
        localeToFlattened[locale] = await transformTranslations(localeToXml[locale], locale);
      }
    }

    // Write flattened translation objects to file. Skip if it would remove one or more keys.
    Object.keys(localeToFlattened).forEach(locale => {
      const newData = localeToFlattened[locale];
      try {
        const oldData = JSON.parse(readFileSync(`${i18nBaseDir}/${locale}.json`).toString('utf8'));
         for (const key in oldData) {
            if (!(key in newData)) {
              // Keep the key.
              newData[key] = oldData[key];
            }
          }
          writeTranslations(`${i18nBaseDir}/${locale}.json`, localeToFlattened[locale]);
      } catch (e) {
        console.error(colors.red(`Could not read existing translations for ${colors.bold(locale)}, skipping...`));
      }
    });
  });
}

main(process.argv);