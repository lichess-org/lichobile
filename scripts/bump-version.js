#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const rootDir = path.join(__dirname, '..')

const capacitorConfPath = path.join(rootDir, 'capacitor.config.json')
const capacitorConfText = fs.readFileSync(capacitorConfPath).toString()

const androidManifestPath = path.join(rootDir, 'android', 'app', 'src', 'main', 'AndroidManifest.xml')
const androidManifestText = fs.readFileSync(androidManifestPath).toString()

const infoPlistPath = path.join(rootDir, 'ios', 'App', 'App', 'Info.plist')
const infoPlistText = fs.readFileSync(infoPlistPath).toString()

// when this script is executed (by npm-version) the new version is accessible
// in package.json
const newVersion = require('../package.json').version;
const newVersionParts = newVersion.split('.')
const newVersionCode =
  newVersionParts[0].padEnd(2, 0) +
  newVersionParts.slice(1).map(p => p.padStart(2, 0)).join('') +
  '0'

// capacitor
let newCapacitorText = capacitorConfText.replace(
  /(Lichobile\/)([^"]+)/,
  '$1' + newVersion
)
fs.writeFileSync(capacitorConfPath, newCapacitorText)

// android
let newAndroidManifestText = androidManifestText.replace(
  /(android:versionName=")([^"]+)(")/,
  '$1' + newVersion + '$3'
)
newAndroidManifestText = newAndroidManifestText.replace(
  /(android:versionCode=")([^"]+)(")/,
  '$1' + newVersionCode + '$3'
)
fs.writeFileSync(androidManifestPath, newAndroidManifestText)

// ios
let newPlistText = infoPlistText.replace(
  /(CFBundleShortVersionString.+?[\s\S]+?<string>)([^<]+)/,
  '$1' + newVersion
)
fs.writeFileSync(infoPlistPath, newPlistText)
