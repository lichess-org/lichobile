#!/usr/bin/env node

const path = require('path')
const fs = require('fs')
const Mustache = require('mustache')

const rootDir = path.join(__dirname, '..')

// dev | release
const mode = process.env.APP_MODE || 'dev'

if (!['dev', 'release'].includes(mode)) {
  console.error("APP_MODE possible value: 'dev' | 'release'")
  process.exit(1)
}


// dev | prod | custom
const confKey = process.env.APP_CONFIG || 'dev'

const config = require(path.join(rootDir, 'appconfig.' + confKey + '.json'))
config.appMode = mode

console.log('Will inject config:')
console.log(config)

const template =
  fs.readFileSync(path.join(rootDir, 'src', 'index.mustache')).toString()
const html = Mustache.render(template, config)

fs.writeFile(path.join(rootDir, 'www', 'index.html'), html, err => {

  if (err) {
    console.error(err)
    process.exit(1)
  }

  console.log('www/index.html successfully saved!')
})
