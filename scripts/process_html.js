#!/usr/bin/env node

const path = require('path')
const fs = require('fs')
const Mustache = require('mustache')

const rootDir = path.join(__dirname, '..')

// web | native
const target = process.env.APP_TARGET || 'web'
// dev | prod
const mode = process.env.APP_MODE || 'dev'
// stage | prod | custom
const confKey = process.env.APP_CONFIG || 'dev'

const config = require(path.join(rootDir, 'appconfig.' + confKey + '.json'))
config.target = target
config.webTarget = target === 'web'
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
