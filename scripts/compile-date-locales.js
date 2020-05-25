#!/usr/bin/env node

const util = require('util')
const exec = util.promisify(require('child_process').exec)
const path = require('path')
const fs = require('fs')

const rootDir = path.join(__dirname, '..')
const rollupConf = path.join(rootDir, 'scripts', 'rollup-locales.config.js')
const source = path.join(rootDir, 'node_modules', 'date-fns', 'esm', 'locale')
const destDir = path.join(rootDir, 'www', 'i18n', 'date')

async function compile(entry) {
  const locale = entry.name
  const module = path.join(source, locale, 'index.js')
  try {
    const { stderr } = await exec(`npx rollup ${module} -c ${rollupConf} --file ${destDir}/${locale}.js`)
    console.log(stderr)
  } catch (err) {
    if (err) {
      console.error(err)
      process.exit(1)
    }
  }
}

async function sequential(iterable, action) {
  for (const e of iterable) {
    await action(e)
  }
}

function execute() {
  console.log('Compiling date-fns locales...')

  console.time('compile-locales')
  Promise.all(
    fs.readdirSync(source, { withFileTypes: true })
    .filter(e => e.isDirectory() && !e.name.startsWith('_'))
      .map(compile)
  ).then(() => {
    console.timeEnd('compile-locales')
  })
}

if (!fs.existsSync(destDir)) {
  execute()
} else {
  console.log('locales already compiled: skipping...')
}
