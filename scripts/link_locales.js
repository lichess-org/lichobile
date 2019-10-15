#!/usr/bin/env node

var fs = require('fs');
const path = require('path')

const rootDir = path.join(__dirname, '..')

var source = path.join(rootDir, 'node_modules', 'date-fns', 'esm', 'locale')
var dest = path.join(rootDir, 'www', 'i18n', 'date')
var frPath = path.join(dest, 'fr', 'index.js')

function recreateLink() {
  // might have broken link
  if (fs.existsSync(dest)) {
    fs.unlinkSync(dest);
  }
  fs.symlinkSync(source, dest);
}

if (fs.existsSync(source)) {
  if (!fs.existsSync(dest)) {
    recreateLink();
  }
  else if (!fs.existsSync(frPath)) {
    recreateLink();
  }
}

if (!fs.existsSync(frPath)) {
  console.error('\x1b[31m%s\x1b[0m', 'Something went wrong with locales symlink. Exiting...');

  process.exit(1);
}
