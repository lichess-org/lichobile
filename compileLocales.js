#!/usr/bin/env node

const directoryExists = require('directory-exists');
const dateDir = 'www/i18n/date';


if(! directoryExists(dateDir, (error, exists) => {
    if(!exists) {
        require('./scripts/compile-locales');
    }
    else {
        console.log('dir \'' + dateDir + '\' exists.')
    }
  }));