#!/bin/sh

npm run build-stage && cordova build android --browserify
